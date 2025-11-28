# Backend Update: GCash Redirect URLs

## IMPORTANT: Update PayMongo Redirect URLs

Sa backend `PayMongo.cs` file, i-update ang redirect URLs para bumalik sa frontend with payment reference.

### Current Code (MALI):
```csharp
var payload = new
{
    data = new
    {
        attributes = new
        {
            amount = (int)(dto.Amount * 100),
            currency = "PHP",
            type = "gcash",
            redirect = new
            {
                success = "http://localhost:3000/cashier/buy-item",  // ❌ WALANG PAYMENT REF
                failed = "https://example.com/failed"
            }
        }
    }
};
```

### Updated Code (TAMA):
```csharp
var payload = new
{
    data = new
    {
        attributes = new
        {
            amount = (int)(dto.Amount * 100),
            currency = "PHP",
            type = "gcash",
            redirect = new
            {
                // ✅ Add payment reference to success URL
                success = $"http://localhost:3000/cashier/buy-item?payment_ref={{PAYMENT_REF}}&status=success",
                
                // ✅ Add failed redirect
                failed = $"http://localhost:3000/cashier/buy-item?payment_ref={{PAYMENT_REF}}&status=failed"
            }
        }
    }
};
```

**PERO**, kailangan mo i-replace ang `{PAYMENT_REF}` placeholder with actual reference ID **AFTER** getting the response from PayMongo.

### BETTER APPROACH - Use actual reference ID:

Sa `CreateGcashPaymentAsync` method:

```csharp
public async Task<PaymentResultDto> CreateGcashPaymentAsync(CreatePaymentDTO dto)
{
    if (dto == null) throw new ArgumentNullException(nameof(dto));
    if (dto.Amount <= 0) throw new ArgumentException("Amount must be greater than zero.");

    var client = new RestClient($"{_baseUrl}/sources");
    var request = new RestRequest();
    request.Method = Method.Post;

    var authToken = Convert.ToBase64String(Encoding.UTF8.GetBytes(_secretKey + ":"));
    request.AddHeader("Authorization", $"Basic {authToken}");
    request.AddHeader("Content-Type", "application/json");

    // NOTE: We can't use the reference ID in redirect URL directly because we don't have it yet
    // PayMongo will provide it after creating the source
    // So we need to use a generic redirect URL or handle it differently

    var payload = new
    {
        data = new
        {
            attributes = new
            {
                amount = (int)(dto.Amount * 100),
                currency = "PHP",
                type = "gcash",
                redirect = new
                {
                    // Generic success URL - frontend will detect and handle
                    success = "http://localhost:3000/cashier/buy-item?status=success",
                    failed = "http://localhost:3000/cashier/buy-item?status=failed"
                }
            }
        }
    };

    request.AddJsonBody(payload);

    var response = await client.ExecuteAsync(request);

    if (!response.IsSuccessful)
        throw new Exception($"PayMongo error ({response.StatusCode}): {response.Content}");

    dynamic result = JsonConvert.DeserializeObject(response.Content!)!;
    string checkoutUrl = result?.data?.attributes?.redirect?.checkout_url!;
    string referenceId = result.data.id;

    if (string.IsNullOrEmpty(checkoutUrl))
        throw new Exception("Checkout URL not found in PayMongo response.");

    // Append reference ID to the checkout URL as metadata
    // This way, it will be passed back in the redirect
    checkoutUrl = $"{checkoutUrl}&ref={referenceId}";

    return new PaymentResultDto
    {
        CheckoutUrl = checkoutUrl,
        ReferenceId = referenceId
    };
}
```

## Alternative: Use PayMongo Metadata (RECOMMENDED)

PayMongo supports metadata in the source creation. Use this to store the reference:

```csharp
var payload = new
{
    data = new
    {
        attributes = new
        {
            amount = (int)(dto.Amount * 100),
            currency = "PHP",
            type = "gcash",
            redirect = new
            {
                success = "http://localhost:3000/cashier/buy-item?status=success",
                failed = "http://localhost:3000/cashier/buy-item?status=failed"
            },
            // ✅ Add metadata to track the payment
            metadata = new
            {
                order_id = dto.Description,
                timestamp = DateTime.UtcNow.ToString("o")
            }
        }
    }
};
```

## Production URLs

Para sa production, palitan ang localhost URLs:

```csharp
success = "https://your-domain.com/cashier/buy-item?status=success",
failed = "https://your-domain.com/cashier/buy-item?status=failed"
```

## How It Works Now

1. User scans GCash QR code
2. Opens GCash app
3. Clicks "Authorize" in GCash
4. **PayMongo redirects back to:** `http://localhost:3000/cashier/buy-item?status=success`
5. Frontend detects the `status=success` parameter
6. Frontend retrieves stored cart data from `localStorage` using the payment reference
7. Frontend automatically completes the purchase
8. Shows success modal

## Frontend Detection (Already Implemented ✅)

Ang frontend ay may code na na:
```typescript
// Check if returning from GCash redirect
const urlParams = new URLSearchParams(window.location.search);
const paymentStatus = urlParams.get('status');

if (paymentStatus === 'success') {
  // Automatically confirm payment and complete purchase
}
```

Kaya ang kailangan mo lang gawin sa backend ay i-set ang redirect URLs properly!
