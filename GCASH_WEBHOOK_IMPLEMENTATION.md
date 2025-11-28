# GCash Webhook Integration - Backend Implementation Guide

## ✅ NEW APPROACH: Create Transactions with "Completed" Status by Default

**USER REQUEST**: Default status should be "Completed" immediately when GCash payment succeeds.

**SOLUTION**: Instead of creating transactions with "PendingPayment" status first, create them directly with "Completed" status when the webhook confirms successful payment.

### UPDATED UpdatePaymentStatusAsync Method:

```csharp
public async Task UpdatePaymentStatusAsync(string paymentReference, string status)
{
    // Only process successful payments
    if (status.ToLower() != "paid")
    {
        Console.WriteLine($"Payment {paymentReference} status is {status}, not creating transactions.");
        return;
    }

    // Check if transactions already exist (avoid duplicates)
    var existingSales = await _context.SalesTransaction
        .Where(s => s.PaymentReference == paymentReference)
        .ToListAsync();

    if (existingSales.Any())
    {
        Console.WriteLine($"Transactions for {paymentReference} already exist, skipping creation.");
        return;
    }

    // Get cart data from PendingPayments table (created when payment was initiated)
    var pendingPayment = await _context.PendingPayments
        .FirstOrDefaultAsync(p => p.ReferenceId == paymentReference);

    if (pendingPayment == null)
    {
        Console.WriteLine($"No pending payment data found for {paymentReference}");
        return;
    }

    // Deserialize cart items
    var cartItems = JsonConvert.DeserializeObject<List<CartItemDTO>>(pendingPayment.CartData);

    Console.WriteLine($"Creating {cartItems.Count} completed transactions for payment {paymentReference}");

    // Create transactions with COMPLETED status by default
    foreach (var item in cartItems)
    {
        var menuItem = await _context.MenuItem.FindAsync(item.MenuItemId);
        if (menuItem == null) continue;

        // Calculate totals
        var subtotal = menuItem.Price * item.Quantity;
        var discountAmount = (subtotal * pendingPayment.DiscountPercent) / 100;
        var taxAmount = (subtotal * pendingPayment.TaxPercent) / 100;
        var total = subtotal + taxAmount - discountAmount;

        // Create sale transaction with COMPLETED status
        var sale = new SalesTransaction
        {
            MenuItemId = item.MenuItemId,
            Quantity = item.Quantity,
            TotalAmount = total,
            DiscountPercent = pendingPayment.DiscountPercent,
            Tax = pendingPayment.TaxPercent,
            PaymentMethod = "GCash",
            PaymentReference = paymentReference,
            Status = "Completed", // ✅ DEFAULT TO COMPLETED
            CashierId = pendingPayment.CashierId,
            BranchId = pendingPayment.BranchId,
            Date = DateTime.Now
        };

        _context.SalesTransaction.Add(sale);

        // Deduct stock immediately since payment is confirmed
        menuItem.Quantity -= item.Quantity;
        if (menuItem.Quantity <= 0)
        {
            menuItem.IsAvailable = "Out of Stock";
        }
        _context.MenuItem.Update(menuItem);

        // Audit log for each item
        _context.AuditLog.Add(new AuditLogEntities
        {
            Username = pendingPayment.CashierId,
            Role = "Cashier",
            Action = "GCash Payment Completed",
            Description = $"GCash payment completed for {menuItem.ItemName} (Qty: {item.Quantity}) - Ref: {paymentReference}",
            Date = DateTime.Now
        });
    }

    // Mark pending payment as processed
    pendingPayment.Status = "Completed";
    pendingPayment.ProcessedDate = DateTime.Now;
    _context.PendingPayments.Update(pendingPayment);

    await _context.SaveChangesAsync();
    Console.WriteLine($"✅ Created {cartItems.Count} completed transactions for payment {paymentReference}");
}
```

**Key Changes:**
1. ✅ **No more status updates** - transactions are created with "Completed" status directly
2. ✅ **Immediate stock deduction** when payment succeeds
3. ✅ **Uses PendingPayments table** to get cart data
4. ✅ **Prevents duplicates** by checking existing transactions
                sale.Status = "PendingPayment";
                break;
        }

        _context.SalesTransaction.Update(sale);
    }

    // Add single audit log for the entire payment
    _context.AuditLog.Add(new AuditLogEntities
    {
        Username = sales.First().CashierId,
        Role = "System",
        Action = "Payment Webhook",
        Description = $"GCash payment status for {sales.Count} item(s) updated to {sales.First().Status} via PayMongo webhook. Ref: {paymentReference}",
        Date = DateTime.Now
    });

    await _context.SaveChangesAsync();
    Console.WriteLine($"✅ Updated {sales.Count} sales for payment reference {paymentReference} to status {sales.First().Status}");
}
```

**Key Changes:**
1. ✅ Uses `.Where().ToListAsync()` instead of `FirstOrDefaultAsync()` to get ALL transactions
2. ✅ Loops through ALL sales with the same payment reference
3. ✅ Deducts stock ONLY when payment succeeds
4. ✅ Proper logging showing how many items were updated

## Overview
Ang frontend ay naka-implement na ng polling mechanism para ma-detect ang successful payment via GCash webhook. Kapag nag-pay ang customer sa GCash, ang webhook ay mag-create ng sale transaction sa database with status "Completed", at ang frontend ay makikita ito at magpapakita ng success modal.

## Simplified Approach (Current Implementation)
Instead of creating transactions first then updating them, ang webhook mismo ang mag-create ng transactions after confirming payment. This is simpler and avoids the need for a separate `BuyWithGcash` endpoint.

## Frontend Implementation (COMPLETED ✅)
1. ✅ GCash payment modal with QR code
2. ✅ Polling mechanism - checks payment status every 3 seconds
3. ✅ Success modal - automatic display kapag successful ang payment
4. ✅ Auto-clear cart after successful payment
5. ✅ Error handling for failed/canceled payments
6. ✅ Session storage of cart data for webhook processing

## Backend Requirements (TODO)

### 1. Update `UpdatePaymentStatusAsync` Method (MOST IMPORTANT)
Ito ang main webhook handler. Kapag successful ang payment, dito na direkta gumawa ng sale transactions.

```csharp
public async Task UpdatePaymentStatusAsync(string paymentReference, string status)
{
    // Check if status is successful
    if (status.ToLower() != "paid")
    {
        Console.WriteLine($"Payment {paymentReference} status is {status}, skipping transaction creation.");
        return;
    }

    // Check if transactions already exist (to avoid duplicates)
    var existingSales = await _context.SalesTransaction
        .Where(s => s.PaymentReference == paymentReference)
        .ToListAsync();

    if (existingSales.Any())
    {
        Console.WriteLine($"Transactions for {paymentReference} already exist, skipping.");
        return;
    }

    // TODO: Get cart items from the payment metadata
    // For now, you need to store cart info when creating the payment source
    // Or retrieve from a temporary table/cache
    
    // This is a placeholder - you need to implement how to get cart items
    // Option 1: Store in payment description/metadata
    // Option 2: Create a PendingPayments table that stores cart items
    // Option 3: Parse from webhook payload if available

    Console.WriteLine($"Payment {paymentReference} is successful. Creating sale transactions...");

    // Example: If you can get the cart items somehow
    // var cartItems = await GetCartItemsForPayment(paymentReference);
    
    // foreach (var item in cartItems)
    // {
    //     var menuItem = await _context.MenuItem.FindAsync(item.MenuItemId);
    //     if (menuItem == null) continue;
    //
    //     // Calculate totals
    //     var subtotal = menuItem.Price * item.Quantity;
    //     var discountAmount = (subtotal * item.DiscountPercent) / 100;
    //     var taxAmount = (subtotal * item.Tax) / 100;
    //     var total = subtotal + taxAmount - discountAmount;
    //
    //     // Create sale transaction
    //     var sale = new SalesTransaction
    //     {
    //         MenuItemId = item.MenuItemId,
    //         Quantity = item.Quantity,
    //         TotalAmount = total,
    //         DiscountPercent = item.DiscountPercent,
    //         Tax = item.Tax,
    //         PaymentMethod = "GCash",
    //         PaymentReference = paymentReference,
    //         Status = "Completed",
    //         CashierId = item.CashierId,
    //         BranchId = menuItem.BranchId,
    //         Date = DateTime.Now
    //     };
    //
    //     _context.SalesTransaction.Add(sale);
    //
    //     // Deduct stock
    //     menuItem.Quantity -= item.Quantity;
    //     if (menuItem.Quantity <= 0)
    //     {
    //         menuItem.IsAvailable = "Out of Stock";
    //     }
    //     _context.MenuItem.Update(menuItem);
    //
    //     // Add audit log
    //     _context.AuditLog.Add(new AuditLogEntities
    //     {
    //         Username = item.CashierId,
    //         Role = "Cashier",
    //         Action = "GCash Payment Completed",
    //         Description = $"GCash payment for {menuItem.ItemName} (Qty: {item.Quantity}) - Ref: {paymentReference}",
    //         Date = DateTime.Now
    //     });
    // }

    await _context.SaveChangesAsync();
    Console.WriteLine($"Sale transactions created successfully for payment {paymentReference}");
}
```

### 2. Create `GetSalesByReference` Endpoint (For Polling)
Ito ay para sa pag-check ng payment status (polling from frontend).

```csharp
[HttpGet("GetSalesByReference")]
public async Task<IActionResult> GetSalesByReference([FromQuery] string reference)
{
    try
    {
        if (string.IsNullOrEmpty(reference))
            return BadRequest("Payment reference is required.");

        // Find sales by payment reference
        var sales = await _context.SalesTransaction
            .Where(s => s.PaymentReference == reference)
            .ToListAsync();

        if (sales == null || !sales.Any())
            return NotFound(new { message = "Payment not yet processed", status = "PendingPayment" });

        // Get the first sale's status (all should have same status)
        var status = sales.First().Status;

        // Return summary
        return Ok(new { 
            status = status,
            count = sales.Count,
            totalAmount = sales.Sum(s => s.TotalAmount),
            paymentMethod = "GCash",
            date = sales.First().Date,
            paymentReference = reference
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = ex.Message });
    }
}
```

### 3. BETTER SOLUTION: Create PendingPayments Table
Para ma-store ang cart items before payment confirmation.

**Database Table:**
```sql
CREATE TABLE PendingPayments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    PaymentReference NVARCHAR(255) NOT NULL,
    CashierId NVARCHAR(255) NOT NULL,
    BranchId INT,
    CartData NVARCHAR(MAX) NOT NULL, -- JSON string of cart items
    DiscountPercent DECIMAL(5,2),
    TaxPercent DECIMAL(5,2),
    TotalAmount DECIMAL(18,2),
    Status NVARCHAR(50) DEFAULT 'Pending',
    CreatedDate DATETIME DEFAULT GETDATE(),
    ProcessedDate DATETIME NULL
);
```

**Entity Class:**
```csharp
public class PendingPayment
{
    public int Id { get; set; }
    public string PaymentReference { get; set; }
    public string CashierId { get; set; }
    public int? BranchId { get; set; }
    public string CartData { get; set; } // JSON
    public decimal DiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? ProcessedDate { get; set; }
}
```

**Create SavePendingPayment Endpoint:**
```csharp
[HttpPost("SavePendingPayment")]
public async Task<IActionResult> SavePendingPayment([FromBody] PendingPaymentDTO dto)
{
    try
    {
        var cashierId = User.FindFirst("cashierId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        var pending = new PendingPayment
        {
            PaymentReference = dto.PaymentReference,
            CashierId = cashierId,
            BranchId = dto.BranchId,
            CartData = JsonConvert.SerializeObject(dto.CartItems),
            DiscountPercent = dto.DiscountPercent,
            TaxPercent = dto.TaxPercent,
            TotalAmount = dto.TotalAmount,
            Status = "Pending",
            CreatedDate = DateTime.Now
        };

        _context.PendingPayments.Add(pending);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Pending payment saved" });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = ex.Message });
    }
}

public class PendingPaymentDTO
{
    public string PaymentReference { get; set; }
    public int? BranchId { get; set; }
    public List<CartItemDTO> CartItems { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal TotalAmount { get; set; }
}

public class CartItemDTO
{
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
```

**Updated UpdatePaymentStatusAsync (Using PendingPayments):**
```csharp
public async Task UpdatePaymentStatusAsync(string paymentReference, string status)
{
    // Find pending payment
    var pending = await _context.PendingPayments
        .FirstOrDefaultAsync(p => p.PaymentReference == paymentReference);

    if (pending == null)
    {
        Console.WriteLine($"No pending payment found for reference {paymentReference}");
        return;
    }

    // Check if already processed
    if (pending.Status != "Pending")
    {
        Console.WriteLine($"Payment {paymentReference} already processed with status {pending.Status}");
        return;
    }

    // Update pending payment status
    if (status.ToLower() == "paid")
    {
        pending.Status = "Completed";
        pending.ProcessedDate = DateTime.Now;

        // Deserialize cart data
        var cartItems = JsonConvert.DeserializeObject<List<CartItemDTO>>(pending.CartData);

        // Create sale transactions
        foreach (var item in cartItems)
        {
            var menuItem = await _context.MenuItem.FindAsync(item.MenuItemId);
            if (menuItem == null) continue;

            // Calculate totals
            var subtotal = menuItem.Price * item.Quantity;
            var discountAmount = (subtotal * pending.DiscountPercent) / 100;
            var taxAmount = (subtotal * pending.TaxPercent) / 100;
            var total = subtotal + taxAmount - discountAmount;

            // Create sale
            var sale = new SalesTransaction
            {
                MenuItemId = item.MenuItemId,
                Quantity = item.Quantity,
                TotalAmount = total,
                DiscountPercent = pending.DiscountPercent,
                Tax = pending.TaxPercent,
                PaymentMethod = "GCash",
                PaymentReference = paymentReference,
                Status = "Completed",
                CashierId = pending.CashierId,
                BranchId = pending.BranchId,
                Date = DateTime.Now
            };

            _context.SalesTransaction.Add(sale);

            // Deduct stock
            menuItem.Quantity -= item.Quantity;
            if (menuItem.Quantity <= 0)
            {
                menuItem.IsAvailable = "Out of Stock";
            }
            _context.MenuItem.Update(menuItem);

            // Audit log
            _context.AuditLog.Add(new AuditLogEntities
            {
                Username = pending.CashierId,
                Role = "Cashier",
                Action = "GCash Payment Completed",
                Description = $"GCash payment for {menuItem.ItemName} (Qty: {item.Quantity}) - Ref: {paymentReference}",
                Date = DateTime.Now
            });
        }

        Console.WriteLine($"✅ Sale transactions created for payment {paymentReference}");
    }
    else
    {
        pending.Status = "Failed";
        pending.ProcessedDate = DateTime.Now;
        Console.WriteLine($"❌ Payment {paymentReference} failed with status {status}");
    }

    _context.PendingPayments.Update(pending);
    await _context.SaveChangesAsync();
}
```

### 4. Ensure Webhook Endpoint is Correct
Make sure ang webhook endpoint ay properly configured:

```csharp
[HttpPost("PayMongoWebHooks")]
public async Task<IActionResult> ReceiveWebhook([FromBody] dynamic payload)
{
    try
    {
        // Log the webhook payload for debugging
        Console.WriteLine($"Webhook received: {JsonConvert.SerializeObject(payload)}");
        
        // Extract the payment reference and status from PayMongo payload
        string paymentReference = payload?.data?.id;
        string status = payload?.data?.attributes?.status;

        if (string.IsNullOrEmpty(paymentReference) || string.IsNullOrEmpty(status))
        {
            Console.WriteLine("Invalid webhook payload - missing reference or status");
            return BadRequest("Invalid webhook payload.");
        }

        Console.WriteLine($"Processing webhook - Reference: {paymentReference}, Status: {status}");

        // Call repository to update payment status
        await _buy.UpdatePaymentStatusAsync(paymentReference, status);

        Console.WriteLine("Webhook processed successfully");
        return Ok(new { message = "Webhook processed successfully" });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Webhook error: {ex.Message}");
        return StatusCode(500, ex.Message);
    }
}
```

## Testing Steps (UPDATED)

1. **Test Successful Payment:**
   - Add items to cart
   - Click GCash button
   - Complete payment in GCash
   - **Check database**: Transactions should be created with `Status = "Completed"` ✅
   - **Check stock**: Should be deducted immediately
   - Frontend polling should detect "completed" status
   - Success modal should appear

2. **Test Multiple Items (CRITICAL):**
   - Add 3-4 items to cart
   - Complete payment
   - **Verify**: ALL transactions have `Status = "Completed"`
   - **Verify**: Stock deducted for ALL items

3. **Test Failed Payment:**
   - Start payment process
   - Cancel in GCash
   - **Check database**: No transactions should be created
   - **Check PendingPayments**: Status should be "Failed"
   - Stock should NOT be deducted

4. **Test Duplicate Prevention:**
   - Complete a payment
   - Try to process the same webhook again
   - **Verify**: No duplicate transactions created

## Database Schema Changes
Ensure `SalesTransaction` table has these fields:
```sql
ALTER TABLE SalesTransaction 
ADD PaymentReference NVARCHAR(255) NULL;

ALTER TABLE SalesTransaction 
ADD Status NVARCHAR(50) DEFAULT 'Completed' NULL;
```

## Important Notes
1. ⚠️ **Stock is deducted ONLY when webhook confirms payment is successful**
2. ⚠️ **Frontend polling checks status every 3 seconds - don't make it too frequent**
3. ⚠️ **Webhook URL must be publicly accessible** (use ngrok, cloudflare tunnel, or deployed server)
4. ⚠️ **Configure webhook in PayMongo dashboard** to point to your endpoint
5. ⚠️ **Test webhook locally** using tools like ngrok before deploying

## PayMongo Webhook Configuration
1. Go to PayMongo Dashboard
2. Navigate to Webhooks section
3. Add new webhook
4. Set URL to: `https://your-domain.com/api/PayGcash/PayMongoWebHooks`
5. Select events: `source.chargeable`
6. Save and test

## Workflow Summary (UPDATED)
```
1. User clicks "GCash" button
   ↓
2. Frontend creates PayMongo payment source
   ↓
3. Frontend calls SavePendingPayment endpoint
   → Stores cart data in PendingPayments table
   → Does NOT create sale transactions yet
   → Does NOT deduct stock yet
   ↓
4. Frontend shows QR code modal
   ↓
5. Frontend starts polling CheckPaymentStatus every 3 seconds
   ↓
6. User scans QR and pays with GCash
   ↓
7. PayMongo webhook fires → ReceiveWebhook endpoint
   ↓
8. Backend calls UpdatePaymentStatusAsync
   → Creates sale transactions with Status = "Completed" ✅
   → Deducts stock from inventory
   → Updates PendingPayments status to "Completed"
   → Adds audit logs
   ↓
9. Frontend polling detects Status = "Completed"
   ↓
10. Frontend shows success modal
    ↓
11. Frontend clears cart after 3 seconds
```

## Frontend API Calls Summary
- `POST /api/PayGcash/PayGcash` - Create payment source
- `GET /api/PayGcash/GcashQrCode` - Generate QR code
- `POST /api/Buy/BuyWithGcash` - Create sale transaction
- `GET /api/PayGcash/CheckPaymentStatus?referenceId={ref}` - Check payment status (polling)
- Webhook: `POST /api/PayGcash/PayMongoWebHooks` - Receives PayMongo webhook

## NEW: CheckPaymentStatus Endpoint Implementation

Add this endpoint to your PayGcashController:

```csharp
[HttpGet("CheckPaymentStatus")]
public async Task<IActionResult> CheckPaymentStatus(string referenceId)
{
    try
    {
        // Check if we have any completed transactions for this payment reference
        var completedTransactions = await _context.SalesTransaction
            .Where(s => s.PaymentReference == referenceId && s.Status == "Completed")
            .ToListAsync();

        if (completedTransactions.Any())
        {
            return Ok(new { 
                status = "completed", 
                message = "Payment completed successfully",
                transactionCount = completedTransactions.Count
            });
        }

        // Check if payment failed
        var failedTransactions = await _context.SalesTransaction
            .Where(s => s.PaymentReference == referenceId && s.Status == "Failed")
            .ToListAsync();

        if (failedTransactions.Any())
        {
            return Ok(new { 
                status = "failed", 
                message = "Payment failed or was cancelled"
            });
        }

        // Check PayMongo API directly as fallback
        // This requires storing the PayMongo payment intent ID
        var paymentIntent = await _context.PendingPayments
            .Where(p => p.ReferenceId == referenceId)
            .FirstOrDefaultAsync();

        if (paymentIntent != null)
        {
            // Call PayMongo API to check status
            var paymongoStatus = await CheckPayMongoPaymentStatus(paymentIntent.PayMongoId);
            
            if (paymongoStatus == "paid")
            {
                // Auto-complete the payment
                await UpdatePaymentStatusAsync(referenceId, "paid");
                return Ok(new { status = "completed", message = "Payment completed successfully" });
            }
            else if (paymongoStatus == "failed" || paymongoStatus == "cancelled")
            {
                await UpdatePaymentStatusAsync(referenceId, "failed");
                return Ok(new { status = "failed", message = "Payment failed or was cancelled" });
            }
        }

        // Still pending
        return Ok(new { 
            status = "pending", 
            message = "Payment is still being processed" 
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error checking payment status for {referenceId}");
        return StatusCode(500, new { 
            status = "error", 
            message = "Unable to check payment status" 
        });
    }
}

private async Task<string> CheckPayMongoPaymentStatus(string paymongoPaymentId)
{
    // Implement PayMongo API call to check payment status
    // This is a placeholder - implement actual PayMongo API integration
    using var client = new HttpClient();
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", 
        Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_paymongoSecretKey}:")));
    
    var response = await client.GetAsync($"https://api.paymongo.com/v1/payment_intents/{paymongoPaymentId}");
    
    if (response.IsSuccessStatusCode)
    {
        var data = await response.Content.ReadAsStringAsync();
        var paymentData = JsonSerializer.Deserialize<PayMongoPaymentResponse>(data);
        return paymentData?.Data?.Attributes?.Status ?? "unknown";
    }
    
    return "unknown";
}
```

### Required Classes/Models:

```csharp
public class PendingPayments
{
    public int Id { get; set; }
    public string ReferenceId { get; set; }
    public string PayMongoId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PayMongoPaymentResponse
{
    public PayMongoPaymentData Data { get; set; }
}

public class PayMongoPaymentData
{
    public PayMongoPaymentAttributes Attributes { get; set; }
}

public class PayMongoPaymentAttributes
{
    public string Status { get; set; } // "pending", "paid", "failed", etc.
}
```

## Status Flow (UPDATED)
```
Payment Initiation:
├── PendingPayments.Status = "Pending"
└── No sale transactions created yet

Payment Successful:
├── PayMongo webhook fires with status = "paid"
├── UpdatePaymentStatusAsync creates transactions with:
│   ├── SalesTransaction.Status = "Completed" ✅ (DEFAULT)
│   ├── Stock deducted immediately
│   └── Audit logs created
└── PendingPayments.Status = "Completed"

Payment Failed:
├── PayMongo webhook fires with status = "failed"
├── No transactions created
└── PendingPayments.Status = "Failed"
```

## API Response Status Values
- `"completed"` - Payment successful, transactions created
- `"failed"` - Payment failed or cancelled
- `"pending"` - Payment still being processed

## Backend Implementation Steps

### 1. Update PayGcashController.cs

Modify the `PayGcash` method to store the PayMongo payment intent ID:

```csharp
[HttpPost("PayGcash")]
public async Task<IActionResult> PayGcash([FromBody] PayGcashDto dto)
{
    // ... existing code ...
    
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
                    success = $"http://localhost:3000/cashier/buy-item?payment_ref={{{PAYMENT_REF}}}&status=success",
                    failed = $"http://localhost:3000/cashier/buy-item?payment_ref={{{PAYMENT_REF}}}&status=failed"
                }
            }
        }
    };

    // ... PayMongo API call ...
    
    if (response.IsSuccessStatusCode)
    {
        var responseContent = await response.Content.ReadAsStringAsync();
        var paymentResponse = JsonSerializer.Deserialize<PayMongoResponse>(responseContent);
        
        // Store the payment intent ID for status checking
        var pendingPayment = new PendingPayments
        {
            ReferenceId = referenceId,
            PayMongoId = paymentResponse.Data.Id,
            CreatedAt = DateTime.Now
        };
        
        _context.PendingPayments.Add(pendingPayment);
        await _context.SaveChangesAsync();
        
        return Ok(new
        {
            checkoutUrl = paymentResponse.Data.Attributes.CheckoutUrl,
            referenceId = referenceId
        });
    }
    
    // ... error handling ...
}
```

### 2. Add PendingPayments Table

```sql
CREATE TABLE PendingPayments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ReferenceId NVARCHAR(100) NOT NULL,
    PayMongoId NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UNIQUE(ReferenceId)
);
```

### 3. Add CheckPaymentStatus Endpoint

```csharp
[HttpGet("CheckPaymentStatus")]
public async Task<IActionResult> CheckPaymentStatus(string referenceId)
{
    try
    {
        // Check if we have any completed transactions for this payment reference
        var completedTransactions = await _context.SalesTransaction
            .Where(s => s.PaymentReference == referenceId && s.Status == "Completed")
            .ToListAsync();

        if (completedTransactions.Any())
        {
            return Ok(new { 
                status = "completed", 
                message = "Payment completed successfully",
                transactionCount = completedTransactions.Count
            });
        }

        // Check if payment failed
        var failedTransactions = await _context.SalesTransaction
            .Where(s => s.PaymentReference == referenceId && s.Status == "Failed")
            .ToListAsync();

        if (failedTransactions.Any())
        {
            return Ok(new { 
                status = "failed", 
                message = "Payment failed or was cancelled"
            });
        }

        // Check PayMongo API directly as fallback
        var paymentIntent = await _context.PendingPayments
            .Where(p => p.ReferenceId == referenceId)
            .FirstOrDefaultAsync();

        if (paymentIntent != null)
        {
            var paymongoStatus = await CheckPayMongoPaymentStatus(paymentIntent.PayMongoId);
            
            if (paymongoStatus == "paid")
            {
                await UpdatePaymentStatusAsync(referenceId, "paid");
                return Ok(new { status = "completed", message = "Payment completed successfully" });
            }
            else if (paymongoStatus == "failed" || paymongoStatus == "cancelled")
            {
                await UpdatePaymentStatusAsync(referenceId, "failed");
                return Ok(new { status = "failed", message = "Payment failed or was cancelled" });
            }
        }

        return Ok(new { 
            status = "pending", 
            message = "Payment is still being processed" 
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { 
            status = "error", 
            message = "Unable to check payment status" 
        });
    }
}
```
