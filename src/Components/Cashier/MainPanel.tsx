import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faSearch, faPlus, faMinus, faTrash, faCheck, faPause, faCreditCard, faBars, faShoppingCart, faChevronDown, faMoneyBill, faBolt, faCheckCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';

interface MenuItemSize {
  id: number;
  size: string;
  price: number;
  isAvailable: boolean;
}

interface MenuItem {
  id: number;
  itemName: string;
  price: number;
  category: string;
  description: string;
  isAvailable: string;
  image: string;
  cashierId?: string;
  branchId?: number | null;
  menuItemSizes?: MenuItemSize[];
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  isAvailable?: string;
  sizes?: MenuItemSize[];
}

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedSizeId?: number;
  selectedPrice?: number;
  sugarLevel?: string;
}

interface MainPanelProps {
  cart: CartItem[];
  onRemoveFromCart: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  total: number;
  onBuy: () => void;
  onHold: () => void;
  onGCashPayment: () => void;
  isLoading: boolean;
  onToggleSidebar?: () => void;
  sidebarExpanded?: boolean;
  onToggleSidebarExpand?: () => void;
  onLogout?: () => void;
  onAddToCart?: (product: Product) => void;
}

const MainPanel: React.FC<MainPanelProps> = ({
  cart,
  onRemoveFromCart,
  onUpdateQuantity,
  total,
  onBuy,
  onHold,
  isLoading,
  onToggleSidebar,
  sidebarExpanded = true,
  onToggleSidebarExpand,
  onAddToCart,
}) => {
  const [showTaxDiscount, setShowTaxDiscount] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<number | string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string>('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [processingHold, setProcessingHold] = useState(false);
  const [holdError, setHoldError] = useState<string>('');
  const [holdSuccess, setHoldSuccess] = useState(false);
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [gcashQrCode, setGcashQrCode] = useState<string>('');
  const [gcashCheckoutUrl, setGcashCheckoutUrl] = useState<string>('');
  const [gcashReference, setGcashReference] = useState<string>('');
  const [processingGCash, setProcessingGCash] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSizeForAdd, setSelectedSizeForAdd] = useState<string>('');
  const [selectedSizeIdForAdd, setSelectedSizeIdForAdd] = useState<number | null>(null);
  const [selectedPriceForAdd, setSelectedPriceForAdd] = useState<number>(0);
  const [showSugarLevelModal, setShowSugarLevelModal] = useState(false);
  const [selectedSugarLevel, setSelectedSugarLevel] = useState<string>('100%');
  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [gcashPaymentStatus, setGcashPaymentStatus] = useState<string>('pending');
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Automatic webhook-based payment completion
  // After user authorizes GCash payment, PayMongo webhook automatically completes purchase
  // Frontend polls CheckTransactionStatus endpoint to detect completion
  
  useEffect(() => {
    if (!showGCashModal || !gcashReference) return;

    console.log('Starting automatic polling for GCash payment completion...');
    
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        console.log(`Polling transaction status for ${gcashReference}...`);
        
        const response = await fetch(`${API_BASE_URL}/PayGcash/CheckTransactionStatus?referenceId=${gcashReference}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Transaction status check result:', result);
          
          if (result.completed) {
            console.log('✅ Transaction completed by webhook! Closing modal and showing success...');
            clearInterval(pollInterval);
            
            // Close GCash modal
            setShowGCashModal(false);
            if (gcashQrCode) {
              URL.revokeObjectURL(gcashQrCode);
            }
            
            // Clear localStorage
            localStorage.removeItem(`gcash_payment_${gcashReference}`);
            
            // Show success modal
            setShowPaymentSuccessModal(true);
            setPurchaseSuccess(true);
            
            // Clear cart and trigger data refresh
            if (onBuy) {
              onBuy();
            }
          } else if (result.status === 'chargeable' || result.status === 'authorized') {
            // Payment authorized but transaction not yet completed
            // Trigger manual completion via TestCompletion endpoint
            console.log('💳 Payment authorized, triggering completion...');
            
            try {
              const completeResponse = await fetch(`${API_BASE_URL}/PayGcash/TestCompletion?referenceId=${gcashReference}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              
              if (completeResponse.ok) {
                const completeResult = await completeResponse.json();
                console.log('Completion result:', completeResult);
                
                if (completeResult.success) {
                  console.log('✅ Purchase completed successfully!');
                  clearInterval(pollInterval);
                  
                  // Close GCash modal
                  setShowGCashModal(false);
                  if (gcashQrCode) {
                    URL.revokeObjectURL(gcashQrCode);
                  }
                  
                  // Clear localStorage
                  localStorage.removeItem(`gcash_payment_${gcashReference}`);
                  
                  // Show success modal
                  setShowPaymentSuccessModal(true);
                  setPurchaseSuccess(true);
                  
                  // Clear cart and trigger data refresh
                  if (onBuy) {
                    onBuy();
                  }
                }
              }
            } catch (err) {
              console.error('Error triggering completion:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error polling transaction status:', err);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      console.log('Stopping transaction status polling');
      clearInterval(pollInterval);
    };
  }, [showGCashModal, gcashReference, gcashQrCode, onBuy]);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        
        // Get token and decode to get cashierId
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          console.error('No access token found');
          setLoading(false);
          return;
        }
        
        // Decode JWT token to get cashierId
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        const cashierId = decodedToken.cashierId || decodedToken.uid;
        
        if (!cashierId) {
          console.error('No cashier ID found in token');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/MenuItem/GetAllMenuItem?cashierId=${cashierId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data: MenuItem[] = await response.json();
        
        console.log('API Response:', data);
        console.log('Number of items:', data.length);
        
        // Transform API data to Product format
        const transformedProducts: Product[] = data.map(item => {
          // Handle base64 image or regular URL
          let imageUrl = item.image;
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            imageUrl = `data:image/jpeg;base64,${imageUrl}`;
          }
          
          return {
            id: item.id,
            name: item.itemName,
            price: item.price,
            category: item.category,
            description: item.description,
            image: imageUrl || '',
            isAvailable: item.isAvailable,
            sizes: item.menuItemSizes || [],
          };
        });
        
        console.log('Transformed products:', transformedProducts);
        
        setProducts(transformedProducts);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...Array.from(new Set(data.map(item => item.category)))];
        setCategories(uniqueCategories);
        console.log('Categories:', uniqueCategories);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add product to cart - with size selection
  const handleAddToCart = (product: Product) => {
    // Check if product is out of stock
    if (product.isAvailable && product.isAvailable.toLowerCase() === 'out of stock') {
      console.log('Product out of stock:', product.name);
      return;
    }
    
    // If product has sizes, show size selection modal
    if (product.sizes && product.sizes.length > 0) {
      setSelectedProduct(product);
      // Set default to first available size
      const firstAvailableSize = product.sizes.find(s => s.isAvailable);
      if (firstAvailableSize) {
        setSelectedSizeForAdd(firstAvailableSize.size);
        setSelectedSizeIdForAdd(firstAvailableSize.id);
        setSelectedPriceForAdd(firstAvailableSize.price);
      }
      setShowSizeModal(true);
      return;
    }
    
    // If no sizes, add directly
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      console.log('Adding to cart:', product);
    }
  };

  // Add to cart with selected size
  const handleAddToCartWithSize = () => {
    if (!selectedProduct) return;
    
    // Close size modal and show sugar level modal
    setShowSizeModal(false);
    setShowSugarLevelModal(true);
  };

  // Add to cart with selected size and sugar level
  const handleAddToCartWithSizeAndSugar = () => {
    if (!selectedProduct) return;
    
    const productWithOptions: CartItem = {
      ...selectedProduct,
      quantity: 1,
      selectedSize: selectedSizeForAdd,
      selectedSizeId: selectedSizeIdForAdd || undefined,
      selectedPrice: selectedPriceForAdd,
      price: selectedPriceForAdd, // Update the price to selected size price
      sugarLevel: selectedSugarLevel,
    };
    
    if (onAddToCart) {
      onAddToCart(productWithOptions);
    }
    
    // Close modal and reset
    setShowSugarLevelModal(false);
    setSelectedProduct(null);
    setSelectedSizeForAdd('');
    setSelectedSizeIdForAdd(null);
    setSelectedPriceForAdd(0);
    setSelectedSugarLevel('100%'); // Reset to default
  };

  // Handle hold transaction
  const handleHoldTransaction = async () => {
    if (cart.length === 0) {
      setHoldError('Cart is empty');
      return;
    }

    setProcessingHold(true);
    setHoldError('');
    setHoldSuccess(false);

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Calculate discount and tax values
      const discountValue = typeof selectedDiscount === 'number' ? selectedDiscount : (selectedDiscount ? parseFloat(selectedDiscount as string) : 0);
      const taxRate = 12; // 12% tax

      // Process each cart item as a separate hold transaction
      const holdPromises = cart.map(async (item) => {
        const holdData = {
          menuItemId: item.id,
          menuItemSizeId: item.selectedSizeId || null,
          size: item.selectedSize || null,
          quantity: item.quantity,
          discountPercent: discountValue,
          tax: taxRate,
          paymentMethod: 'Cash'
        };

        console.log('Sending hold request:', holdData);

        const response = await fetch(`${API_BASE_URL}/Buy/HoldTransaction`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(holdData)
        });

        // Get response text first
        const responseText = await response.text();
        console.log('Hold response:', responseText);
        console.log('Response status:', response.status);

        if (!response.ok) {
          console.error('Hold error response:', responseText);

          // Try to parse as JSON, fallback to plain text
          let errorMessage = responseText;
          try {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.message || errorJson.error || errorJson.title || responseText;
          } catch (e) {
            errorMessage = responseText;
          }

          throw new Error(errorMessage || `Failed to hold ${item.name}`);
        }

        // Parse successful response as JSON
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
            console.warn('Response is not JSON:', responseText);
          result = { success: true, message: responseText };
        }

        console.log('Hold successful for item:', item.name, result);
        return result;
      });

      // Wait for all hold transactions to complete
      await Promise.all(holdPromises);console.log('All transactions held successfully');
      setHoldSuccess(true);
      
      // Clear cart after successful hold
      setTimeout(() => {
        if (onHold) {
          onHold();
        }
        setHoldSuccess(false);
        setSelectedDiscount('');
      }, 2000);

    } catch (err) {
      console.error('Error holding transaction:', err);
      setHoldError(err instanceof Error ? err.message : 'Failed to hold transaction. Please try again.');
    } finally {
      setProcessingHold(false);
    }
  };

  // Handle GCash payment with QR code
  const handleGCashPayment = async () => {
    if (cart.length === 0) {
      setPurchaseError('Cart is empty');
      return;
    }

    setProcessingGCash(true);
    setPurchaseError('');

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Calculate discount and final total
      const discountValue = typeof selectedDiscount === 'number' ? selectedDiscount : (selectedDiscount ? parseFloat(selectedDiscount as string) : 0);
      const discountAmount = (total * discountValue) / 100;
      const taxRate = 12; // 12% tax
      const taxAmount = (total * taxRate) / 100;
      const finalTotal = Math.max(0, total + taxAmount - discountAmount);

      console.log('Creating GCash payment:', { amount: finalTotal });

      // Call PayGcash API to create payment
      const paymentResponse = await fetch(`${API_BASE_URL}/PayGcash/PayGcash`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalTotal,
          description: `Payment for ${cart.length} item(s) - Cart Total`
        })
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('GCash payment error:', errorText);
        throw new Error('Failed to create GCash payment');
      }

      const paymentData = await paymentResponse.json();
      console.log('GCash payment created:', paymentData);

      const checkoutUrl = paymentData.checkoutUrl;
      const referenceId = paymentData.referenceId;

      if (!checkoutUrl) {
        throw new Error('Checkout URL not received from payment API');
      }

      // Store cart data and payment info in localStorage for webhook processing
      const gcashPaymentInfo = {
        cart: cart,
        discount: discountValue,
        tax: taxRate,
        total: finalTotal,
        referenceId: referenceId,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`gcash_payment_${referenceId}`, JSON.stringify(gcashPaymentInfo));

      // Save pending payment to backend so the webhook can create completed transactions
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Extract branchId and cashierId from token (if available)
          let branchId: number | null = null;
          let cashierId: string | null = null;
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decodedToken = JSON.parse(jsonPayload);
            if (decodedToken.branchId) branchId = Number(decodedToken.branchId);
            // Use cashierId claim (same as what Purchases.tsx uses)
            if (decodedToken.cashierId) cashierId = decodedToken.cashierId;
            else if (decodedToken.uid) cashierId = decodedToken.uid;
            console.log('Extracted cashierId for GCash payment:', cashierId);
          } catch (ex) {
            console.warn('Failed to parse token for branchId/cashierId:', ex);
            // branchId and cashierId remain null
          }

          const pendingDto = {
            PaymentReference: referenceId,
            CashierId: cashierId,
            BranchId: branchId,
            CartItems: cart.map((i: any) => ({ 
              MenuItemId: Number(i.id), 
              MenuItemSizeId: i.selectedSizeId || null,
              Size: i.selectedSize || 'Regular',
              Quantity: Number(i.quantity), 
              Price: Number(i.selectedPrice || i.price),
              SugarLevel: i.sugarLevel || 'N/A'
            })),
            DiscountPercent: Number(discountValue) || 0,
            TaxPercent: Number(taxRate) || 12,
            TotalAmount: finalTotal,
          };

          const saveResponse = await fetch(`${API_BASE_URL}/PayGcash/SavePendingPayment`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pendingDto),
          });

          if (!saveResponse.ok) {
            console.warn('SavePendingPayment failed:', await saveResponse.text());
          } else {
            console.log('Pending payment saved to backend');
          }
        }
      } catch (err) {
        console.warn('Error while saving pending payment to backend', err);
      }

      console.log('GCash payment info stored for reference:', referenceId);

      // Generate QR code from checkout URL
      const qrResponse = await fetch(`${API_BASE_URL}/PayGcash/GcashQrCode?checkoutUrl=${encodeURIComponent(checkoutUrl)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!qrResponse.ok) {
        throw new Error('Failed to generate QR code');
      }

      const qrBlob = await qrResponse.blob();
      const qrImageUrl = URL.createObjectURL(qrBlob);

      // Show modal with QR code
      setGcashQrCode(qrImageUrl);
      setGcashCheckoutUrl(checkoutUrl);
      setGcashReference(referenceId);
      setShowGCashModal(true);

      console.log('GCash QR code generated successfully');

    } catch (err) {
      console.error('Error creating GCash payment:', err);
      setPurchaseError(err instanceof Error ? err.message : 'Failed to create GCash payment. Please try again.');
    } finally {
      setProcessingGCash(false);
    }
  };

  // Handle complete purchase
  const handleCompletePurchase = async (paymentMethod: string = 'Cash') => {
    if (cart.length === 0) {
      setPurchaseError('Cart is empty');
      return;
    }

    setProcessingPurchase(true);
    setPurchaseError('');
    setPurchaseSuccess(false);

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Calculate discount value for logging
      const discountValue = typeof selectedDiscount === 'number' ? selectedDiscount : (selectedDiscount ? parseFloat(selectedDiscount as string) : 0);

      // ✅ Check if this is a resumed hold transaction
      const resumeHoldId = sessionStorage.getItem('resumeHoldId');

      if (resumeHoldId) {
        // ✅ This is a resumed hold - Call ResumeTransaction API to deduct stock
        console.log('Completing resumed hold transaction:', resumeHoldId);

        const response = await fetch(`${API_BASE_URL}/Buy/ResumeTransaction?saleId=${resumeHoldId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const responseText = await response.text();
        console.log('Resume hold response:', responseText);
        console.log('Resume hold status:', response.status);

        if (!response.ok) {
          // Parse error message
          let errorMessage = responseText;
          try {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.message || errorJson.error || errorJson.title || responseText;
          } catch (e) {
            errorMessage = responseText;
          }
          
          console.error('Resume hold error:', errorMessage);
          throw new Error(errorMessage || 'Failed to complete hold transaction');
        }

        console.log('Hold transaction completed successfully:', responseText);
        
        // Clear resume data
        sessionStorage.removeItem('resumeHoldId');
        sessionStorage.removeItem('resumeCart');
        sessionStorage.removeItem('resumeDiscount');
        sessionStorage.removeItem('resumeTax');

      } else {
        // ✅ Regular purchase - Use normal Buy endpoint
        const taxRate = 12; // 12% tax

        // Decode token to get cashierId for debugging
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedToken = JSON.parse(jsonPayload);
        const cashierId = decodedToken.cashierId || decodedToken.uid;
        
        console.log('=== TOKEN & USER INFO ===');
        console.log('Full decoded token:', JSON.stringify(decodedToken, null, 2));
        console.log('Extracted cashier ID:', cashierId);
        console.log('Token claims:', Object.keys(decodedToken));
        console.log('========================');
        console.log('Cart items:', JSON.stringify(cart, null, 2));

        // Process each cart item as a separate purchase
        const purchasePromises = cart.map(async (item) => {
          // Ensure proper data types
          const purchaseData = {
            menuItemId: Number(item.id), // Ensure it's a number
            menuItemSizeId: item.selectedSizeId ? Number(item.selectedSizeId) : null,
            size: item.selectedSize || null,
            sugarLevel: item.sugarLevel || '100%', // Include sugar level, default to 100%
            quantity: Number(item.quantity), // Ensure it's a number
            discountPercent: Number(discountValue), // Ensure it's a number
            tax: Number(taxRate), // Ensure it's a number
            paymentMethod: String(paymentMethod) // Ensure it's a string
          };

          console.log('=== PURCHASE REQUEST START ===');
          console.log('Sending purchase request:', JSON.stringify(purchaseData, null, 2));
          console.log('Item details:', JSON.stringify({ id: item.id, name: item.name, price: item.price, category: item.category }, null, 2));
          console.log('API URL:', `${API_BASE_URL}/Buy/Buy`);
          console.log('Authorization token present:', !!token);
          console.log('Request body:', JSON.stringify(purchaseData));
          console.log('==============================');

          const response = await fetch(`${API_BASE_URL}/Buy/Buy`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(purchaseData)
          });

          const responseText = await response.text();
          console.log('Raw response:', responseText);
          console.log('Response status:', response.status);
          console.log('Response headers:', response.headers);

          if (!response.ok) {
            console.error('=== PURCHASE ERROR DETAILS ===');
            console.error('Purchase error response:', responseText);
            console.error('Failed item:', JSON.stringify(item, null, 2));
            console.error('Request payload:', JSON.stringify(purchaseData, null, 2));
            console.error('Response status code:', response.status);
            console.error('Response status text:', response.statusText);

            let errorMessage = 'Purchase failed';
            try {
              const errorJson = JSON.parse(responseText);
              console.error('Parsed error JSON:', JSON.stringify(errorJson, null, 2));
              
              // Try to extract more specific error message
              if (errorJson.error) {
                errorMessage = errorJson.error;
              } else if (errorJson.message) {
                errorMessage = errorJson.message;
              } else if (errorJson.title) {
                errorMessage = errorJson.title;
              }
              
              // If there's an inner exception or details, show it
              if (errorJson.errors) {
                const errorDetails = Object.entries(errorJson.errors).map(([key, value]) => `${key}: ${value}`).join(', ');
                errorMessage += ` - ${errorDetails}`;
              }
              
              // Check for inner exception details
              if (errorJson.innerException) {
                console.error('Inner exception:', errorJson.innerException);
                errorMessage += ` (Inner: ${errorJson.innerException})`;
              }
              
              // Check for validation errors
              if (errorJson.validationErrors) {
                console.error('Validation errors:', errorJson.validationErrors);
              }
              
              // Check for message field (common in backend errors)
              if (errorJson.message && !errorMessage.includes(errorJson.message)) {
                errorMessage = errorJson.message;
              }
            } catch (e) {
              console.error('Failed to parse error JSON:', e);
              errorMessage = responseText;
            }

            // More descriptive error message
            throw new Error(`${item.name}: ${errorMessage}`);
          }

          // Success - Backend returns JSON with message field containing receipt
          console.log('=== PURCHASE SUCCESS ===');
          console.log('Purchase successful for item:', item.name);
          console.log('Response:', responseText);
          
          // Try to parse as JSON (backend returns { message: "receipt text" })
          let receiptText = responseText;
          try {
            const successJson = JSON.parse(responseText);
            if (successJson.message) {
              receiptText = successJson.message;
            }
          } catch (e) {
            // If not JSON, use plain text
            receiptText = responseText;
          }
          
          console.log('Receipt:', receiptText);
          console.log('========================');
          return { success: true, receipt: receiptText, itemName: item.name };
        });

        // Wait for all purchases to complete
        const results = await Promise.all(purchasePromises);
        
        // Log receipts to console for reference
        if (results.length > 0) {
          const receipts = results.map(r => r.receipt).join('\n\n---\n\n');
          console.log('Purchase Receipts:\n', receipts);
        }
      }

      console.log('All purchases completed successfully');
      setPurchaseSuccess(true);
      
      // Clear cart after successful purchase
      setTimeout(() => {
        // Call the original onBuy callback if provided (to clear cart)
        if (onBuy) {
          onBuy();
        }
        setPurchaseSuccess(false);
        setSelectedDiscount('');
      }, 1000);

    } catch (err) {
      console.error('=== PURCHASE ERROR ===');
      console.error('Error completing purchase:', err);
      console.error('Cart at time of error:', cart);
      console.error('Discount at time of error:', discountValue);
      console.error('======================');
      
      const errorMsg = err instanceof Error ? err.message : 'Failed to complete purchase. Please try again.';
      setPurchaseError(errorMsg);
    } finally {
      setProcessingPurchase(false);
    }
  };

  // Sample discount data from database - you can replace this with API call
  const discountOptions = [
    { id: 1, label: 'No Discount', value: 0 },
    { id: 2, label: 'Senior Citizen (5%)', value: 5 },
    { id: 3, label: 'PWD Discount (10%)', value: 10 },
    { id: 4, label: 'Student Discount (15%)', value: 15 },
    { id: 5, label: 'Member Promo (20%)', value: 20 },
    { id: 6, label: 'Staff Discount (25%)', value: 25 },
  ];
  
  // Calculate discounted total (percentage only)
  const discountValue = typeof selectedDiscount === 'number' ? selectedDiscount : (selectedDiscount ? parseFloat(selectedDiscount as string) : 0);
  const discountAmount = (total * discountValue) / 100;
  const finalTotal = Math.max(0, total - discountAmount);
  
  return (
    <div className={`flex h-screen flex-1 flex-col bg-stone-50 dark:bg-stone-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
      {/* Top Bar - Search & Filters */}
      <div className="sticky top-0 z-10 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-6 sm:px-8 md:px-10 py-6 shadow-sm transition-all duration-300">
        {/* Top Section: Sidebar Toggle | Search Bar | Logout Panel */}
        <div className="flex items-center justify-between gap-4 sm:gap-5">
          {/* Left: Sidebar Toggle + Search Bar */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Hamburger Menu - Mobile Only */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-orange-600 dark:text-orange-400 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex-shrink-0"
            >
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>
            
            {/* Sidebar Toggle Button - Desktop Only */}
            <button
              onClick={onToggleSidebarExpand}
              className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
              title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>

            {/* Premium Search Bar - Left Aligned */}
            <div className="flex items-center gap-3 relative group flex-1 min-w-0">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3 bg-stone-50 dark:bg-stone-800 rounded-xl border-2 border-stone-200 dark:border-stone-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-4 shadow-lg hover:shadow-xl transition-all duration-300 w-full">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="h-5 w-5 text-stone-400 dark:text-stone-500 group-focus-within:text-orange-500 transition-colors flex-shrink-0"
                />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 shadow-none focus:outline-none min-w-0"
                />
                {searchText && (
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
                    {filteredProducts.length} found
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Logout Panel */}
          <div className="flex-shrink-0">
            <LogoutPanel />
          </div>
        </div>
      </div>

      {/* Main Content Area - Proper padding and alignment */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden gap-6 px-6 sm:px-8 md:px-10 py-6 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800">
        {/* Left Section: Products & Filters - Main content area */}
        <div className="flex-1 flex flex-col gap-5 min-w-0 overflow-hidden">
          {/* Category Filter */}
          <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 px-6 py-6 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 dark:from-orange-500/5 dark:to-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30">
                  <FontAwesomeIcon icon={faCoffee} className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider text-stone-500 dark:text-stone-400 uppercase">Filter by</p>
                  <p className="text-sm font-bold text-stone-900 dark:text-white">Categories</p>
                </div>
              </div>
              
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-3 items-center">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`group rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 border-2 whitespace-nowrap relative overflow-hidden ${
                      selectedCategory === category
                        ? 'border-transparent bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 scale-105'
                        : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-white hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <span className="relative z-10">{category}</span>
                    {selectedCategory === category && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-600/20 animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Section (Scrollable) */}
          <div className="flex-1 flex flex-col rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-stone-200 dark:border-stone-700 bg-gradient-to-r from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900 px-6 py-5">
              <h3 className="text-base font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-3">
                <FontAwesomeIcon icon={faCoffee} className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                <span>Available Items</span>
                <span className="ml-auto font-semibold text-stone-600 dark:text-stone-400 text-sm bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700">({filteredProducts.length})</span>
              </h3>
            </div>

            {/* Products Grid (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-5 scroll-smooth">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
                    <p className="mt-4 text-sm font-medium text-stone-600 dark:text-stone-400">Loading menu items...</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 auto-rows-max" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => {
                      const isOutOfStock = !!(product.isAvailable && product.isAvailable.toLowerCase() === 'out of stock');
                      return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && handleAddToCart(product)}
                      className={`product-card-motion group rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 transition-all duration-300 overflow-hidden flex flex-col relative ${
                        isOutOfStock 
                          ? 'opacity-60 cursor-not-allowed' 
                          : 'cursor-pointer hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-400 dark:hover:border-orange-500 active:scale-95 hover:-translate-y-2'
                      }`}
                    >
                      {/* Product Image */}
                      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-stone-100 dark:from-stone-700 dark:via-stone-750 dark:to-stone-800">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-all duration-500 ${!isOutOfStock && 'group-hover:scale-110 group-hover:rotate-2'}`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-stone-700 dark:to-stone-600 group-hover:from-orange-100 group-hover:to-amber-200 dark:group-hover:from-stone-650 dark:group-hover:to-stone-550 transition-all duration-300">
                            <FontAwesomeIcon icon={faCoffee} className="h-12 w-12 text-orange-300 dark:text-orange-500/50" />
                          </div>
                        )}
                        
                        {/* Out of Stock Overlay */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="text-center px-4">
                              <p className="text-white font-black text-lg uppercase tracking-wider">Out of Stock</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Gradient Overlay */}
                        {!isOutOfStock && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        )}
                        
                        {/* Category Badge */}
                        {!isOutOfStock && (
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-sm text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            {product.category}
                          </div>
                        )}
                        

                      </div>

                      {/* Content - Bottom Section */}
                      <div className="flex-1 flex flex-col p-5 bg-gradient-to-b from-stone-50 to-stone-100/50 dark:from-stone-800 dark:to-stone-850/50">
                        <div className="flex-1 min-w-0 mb-4">
                          <h4 className={`font-bold text-base leading-tight line-clamp-2 mb-2 transition-colors duration-300 ${
                            isOutOfStock 
                              ? 'text-stone-400 dark:text-stone-600' 
                              : 'text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400'
                          }`}>
                            {product.name}
                          </h4>
                          {product.description && (
                            <p className={`text-xs line-clamp-2 mb-2 ${
                              isOutOfStock 
                                ? 'text-stone-400 dark:text-stone-600' 
                                : 'text-stone-600 dark:text-stone-400'
                            }`}>
                              {product.description}
                            </p>
                          )}
                          <div className={`flex items-center gap-2 text-[11px] ${
                            isOutOfStock 
                              ? 'text-stone-400 dark:text-stone-600' 
                              : 'text-stone-500 dark:text-stone-400'
                          }`}>
                            <div className={`h-1 w-1 rounded-full ${isOutOfStock ? 'bg-stone-400' : 'bg-orange-500'}`}></div>
                            <span className="font-medium">{product.category}</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
                          <div className="flex flex-col flex-1">
                            <span className={`text-[10px] font-medium uppercase tracking-wider mb-0.5 ${
                              isOutOfStock 
                                ? 'text-stone-400 dark:text-stone-600' 
                                : 'text-stone-500 dark:text-stone-400'
                            }`}>
                              {product.sizes && product.sizes.length > 0 ? 'From' : 'Price'}
                            </span>
                            <span className={`text-xl font-black ${
                              isOutOfStock 
                                ? 'text-stone-400 dark:text-stone-600' 
                                : 'bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent'
                            }`}>
                              ₱{product.sizes && product.sizes.length > 0 ? Math.min(...product.sizes.map(s => s.price)) : product.price}
                            </span>
                            {product.sizes && product.sizes.length > 0 && !isOutOfStock && (
                              <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                                {product.sizes.length} sizes available
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isOutOfStock) handleAddToCart(product);
                            }}
                            disabled={isOutOfStock}
                            className={`group/btn inline-flex items-center justify-center rounded-xl p-3 text-white transition-all duration-200 shadow-md ${
                              isOutOfStock
                                ? 'bg-stone-400 dark:bg-stone-600 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 dark:from-orange-500 dark:to-orange-400 dark:hover:from-orange-600 dark:hover:to-orange-500 hover:shadow-lg hover:shadow-orange-500/50 active:scale-90 hover:scale-110'
                            }`}
                          >
                            <FontAwesomeIcon icon={faPlus} className={`h-4 w-4 ${!isOutOfStock && 'group-hover/btn:rotate-90'} transition-transform duration-300`} />
                          </button>
                        </div>
                      </div>

                      {/* Shine Effect on Hover */}
                      {!isOutOfStock && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none"></div>
                      )}
                    </div>
                    );
                  })
                ) : (
                  <div className="col-span-full flex items-center justify-center py-24">
                    <div className="text-center">
                      <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800/30">
                        <FontAwesomeIcon icon={faSearch} className="h-9 w-9 text-orange-400 dark:text-orange-500" />
                      </div>
                      <p className="text-base font-bold text-stone-900 dark:text-stone-50 mb-1">
                        No items found
                      </p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Section - More spacious */}
        <div className="w-full lg:w-96 lg:min-w-[384px] xl:w-[420px] xl:min-w-[420px] flex flex-col rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 shadow-xl shadow-stone-200/50 dark:shadow-stone-800/50 overflow-hidden flex-shrink-0 h-full">
          {/* Cart Header - More breathing room */}
          <div className="border-b-2 border-stone-200 dark:border-stone-700 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 dark:from-orange-600 dark:via-orange-700 dark:to-amber-700 px-6 py-5 flex-shrink-0 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 dark:opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 dark:bg-stone-950 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 dark:bg-stone-950 rounded-full blur-2xl -ml-12 -mb-12"></div>
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm border border-white/30 shadow-lg">
                  <FontAwesomeIcon icon={faShoppingCart} className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Shopping Cart</h3>
                  <p className="text-sm text-orange-100 font-medium mt-0.5">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-full bg-stone-50/20 backdrop-blur-sm border border-white/30">
                  <span className="font-black text-base text-white">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Items (Scrollable) - More spacing */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scroll-smooth min-h-0">
            {cart.length > 0 ? (
              cart.map((item, index) => (
                <div
                  key={item.id}
                  className="cart-item-motion group flex flex-col gap-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-gradient-to-br from-stone-50 to-stone-100/50 dark:from-stone-800 dark:to-stone-850/50 p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-400 dark:hover:border-orange-500 relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Background Decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-2xl"></div>
                  
                  {/* Top Row: Icon + Item Info + Remove */}
                  <div className="relative flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 text-white font-bold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0 shadow-lg shadow-orange-500/30">
                      <FontAwesomeIcon icon={faCoffee} className="h-5 w-5" />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-stone-900 dark:text-white leading-tight mb-1.5 line-clamp-2">
                        {item.name}
                      </p>
                      {item.selectedSize && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">
                          Size: <span className="font-semibold text-orange-600 dark:text-orange-400">{item.selectedSize}</span>
                        </p>
                      )}
                      {item.sugarLevel && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">
                          Sugar: <span className="font-semibold text-orange-600 dark:text-orange-400">{item.sugarLevel}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-semibold flex-wrap">
                        <span>₱{item.price.toFixed(2)}</span>
                        <span className="text-stone-400 dark:text-stone-500">×</span>
                        <span>{item.quantity}</span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveFromCart(item.id)}
                      className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold transition-all duration-200 active:scale-90 hover:scale-110 flex-shrink-0 shadow-md shadow-red-500/30 hover:shadow-lg"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Bottom Row: Quantity Controls + Line Total */}
                  <div className="relative flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 bg-stone-50 dark:bg-stone-900 rounded-lg p-1 border-2 border-stone-200 dark:border-stone-700 shadow-sm">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-stone-900 dark:text-white font-bold transition-all duration-200 active:scale-90 hover:text-orange-600 dark:hover:text-orange-400 border border-transparent hover:border-orange-300 dark:hover:border-orange-600"
                      >
                        <FontAwesomeIcon icon={faMinus} className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 min-w-[36px] text-center font-bold text-sm text-stone-900 dark:text-white px-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-md bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-bold transition-all duration-200 active:scale-90 border border-transparent hover:border-orange-300 dark:hover:border-orange-600"
                      >
                        <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-0.5">Total</span>
                      <span className="text-lg font-black bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent whitespace-nowrap">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center py-20">
                <div className="text-center">
                  <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800/30">
                    <FontAwesomeIcon icon={faShoppingCart} className="h-10 w-10 text-orange-400 dark:text-orange-500" />
                  </div>
                  <p className="text-base font-bold text-stone-900 dark:text-white mb-2">
                    Cart is empty
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Add items to get started
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cart Footer with Total - Scrollable when breakdown is open */}
          <div className="flex-shrink min-h-0 border-t-2 border-stone-200 dark:border-stone-700 bg-gradient-to-br from-stone-50 via-stone-50 to-stone-100 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-stone-200 dark:scrollbar-thumb-orange-600 dark:scrollbar-track-stone-800">
            <div className="px-6 py-6 space-y-5">
              {/* Final Total Amount Section */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-orange-200 dark:border-orange-800/30 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-orange-950/30 p-6">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-amber-400/20 to-transparent rounded-full blur-xl"></div>
                
                <div className="relative flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                    <span className="text-sm font-black tracking-widest text-orange-700 dark:text-orange-400 uppercase">Total Amount</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 dark:from-orange-400 dark:via-orange-300 dark:to-amber-400 bg-clip-text text-transparent leading-none">
                      ₱{finalTotal.toFixed(2)}
                    </span>
                    {discountValue > 0 && (
                      <span className="text-base font-bold text-red-500 dark:text-red-400 line-through opacity-75">
                        ₱{total.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {discountValue > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50">
                        <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">-{discountValue}% Discount</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Breakdown Toggle */}
              <button
                onClick={() => setShowTaxDiscount(!showTaxDiscount)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 group-hover:from-orange-200 group-hover:to-amber-200 dark:group-hover:from-orange-900/50 dark:group-hover:to-amber-900/50 transition-all duration-300">
                    <FontAwesomeIcon icon={faChevronDown} className={`h-4 w-4 text-orange-600 dark:text-orange-400 transition-transform duration-300 ${showTaxDiscount ? 'rotate-180' : ''}`} />
                  </div>
                  <span className="font-bold text-base text-stone-900 dark:text-white">View Breakdown</span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/50">
                  <span className="text-xs font-black text-orange-600 dark:text-orange-400">{cart.reduce((sum, item) => sum + item.quantity, 0)} ITEMS</span>
                </div>
              </button>

              {/* Tax, Discount Details */}
              {showTaxDiscount && (
                <div className="space-y-4 pt-1 animate-in slide-in-from-top duration-300">
                  {/* Base Calculations */}
                  <div className="space-y-3 px-5 py-4 rounded-xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-700">
                    <div className="flex items-center justify-between text-base">
                      <span className="font-semibold text-stone-600 dark:text-stone-400">Subtotal:</span>
                      <span className="font-bold text-stone-900 dark:text-white">₱{total.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-stone-300 dark:bg-stone-700"></div>
                    <div className="flex items-center justify-between text-base">
                      <span className="font-semibold text-stone-600 dark:text-stone-400">Tax (12%):</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">₱{(total * 0.12).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Custom Discount Section */}
                  <div className="px-5 py-4 rounded-xl bg-stone-50 dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700">
                    <label className="text-sm font-black text-orange-600 dark:text-orange-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                      Apply Discount
                    </label>
                    <select
                      value={selectedDiscount}
                      onChange={(e) => setSelectedDiscount(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full px-4 py-3.5 text-base bg-stone-50 dark:bg-stone-850 border-2 border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-900 dark:text-white hover:border-orange-400 dark:hover:border-orange-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
                    >
                      <option value="">No Discount</option>
                      {discountOptions.map((option) => (
                        <option key={option.id} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Discount Amount Display */}
                  {discountValue > 0 && (
                    <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-2 border-red-200 dark:border-red-800/30">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-base font-black text-red-700 dark:text-red-400">Discount Applied:</span>
                      </div>
                      <span className="font-black text-lg text-red-600 dark:text-red-400">-₱{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - More spacing */}
          <div className="flex-shrink-0 border-t-2 border-stone-200 dark:border-stone-700 space-y-4 bg-gradient-to-b from-stone-100 to-stone-50 dark:from-stone-900 dark:to-stone-850 px-6 py-6">
            {/* Success/Error Messages */}
            {purchaseError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800/50 animate-in slide-in-from-top duration-300">
                <p className="text-sm font-bold text-red-600 dark:text-red-400 text-center">{purchaseError}</p>
              </div>
            )}
            
            {purchaseSuccess && (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800/50 animate-in slide-in-from-top duration-300">
                <p className="text-sm font-bold text-green-600 dark:text-green-400 text-center">Purchase completed successfully!</p>
              </div>
            )}

            {/* Primary Action - Buy */}
            <button
              onClick={() => setShowCashPaymentModal(true)}
              disabled={processingPurchase || isLoading || cart.length === 0}
              className="group w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:via-orange-600 hover:to-amber-700 dark:from-orange-500 dark:via-orange-400 dark:to-amber-500 dark:hover:from-orange-600 dark:hover:via-orange-500 dark:hover:to-amber-600 px-6 py-5 text-lg font-black text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-orange-600 disabled:hover:via-orange-500 disabled:hover:to-amber-600 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-105 disabled:hover:scale-100 relative overflow-hidden"
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              
              {processingPurchase || isLoading ? (
                <>
                  <svg className="h-6 w-6 animate-spin relative z-10" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                  </svg>
                  <span className="relative z-10 tracking-wide">Processing...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform" />
                  <span className="relative z-10 tracking-wide">Complete Purchase</span>
                </>
              )}
            </button>

            {/* Hold Error/Success Messages */}
            {holdError && (
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-800/50 animate-in slide-in-from-top duration-300">
                <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400 text-center">{holdError}</p>
              </div>
            )}
            
            {holdSuccess && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800/50 animate-in slide-in-from-top duration-300">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 text-center">Transaction held successfully!</p>
              </div>
            )}

            {/* Secondary Actions - Grid Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Hold Button */}
              <button
                onClick={handleHoldTransaction}
                disabled={processingHold || isLoading || cart.length === 0}
                className="group flex items-center justify-center gap-2.5 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 hover:bg-gradient-to-br hover:from-stone-100 hover:to-stone-100 dark:hover:from-stone-850 dark:hover:to-stone-850 hover:border-orange-400 dark:hover:border-orange-500 px-5 py-4 text-base font-black text-stone-900 dark:text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
              >
                {processingHold ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                    </svg>
                    <span>Holding...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPause} className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>Hold</span>
                  </>
                )}
              </button>

              {/* GCash Payment Button */}
              <button
                onClick={handleGCashPayment}
                disabled={processingGCash || processingPurchase || isLoading || cart.length === 0}
                className="group flex items-center justify-center gap-2.5 rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-5 py-4 text-base font-black text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 disabled:hover:scale-100 relative overflow-hidden"
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                
                {processingGCash ? (
                  <>
                    <svg className="h-5 w-5 animate-spin relative z-10" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                    </svg>
                    <span className="relative z-10">Loading...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCreditCard} className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform" />
                    <span className="relative z-10">GCash</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GCash QR Code Modal */}
      {showGCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg mx-4 bg-stone-50 dark:bg-stone-900 rounded-2xl shadow-2xl border-2 border-blue-500 dark:border-blue-600 overflow-hidden animate-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -mr-16 -mt-16"></div>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                    <FontAwesomeIcon icon={faCreditCard} className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">GCash Payment</h3>
                    <p className="text-sm text-blue-100">Scan QR code to pay</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowGCashModal(false);
                    if (gcashQrCode) {
                      URL.revokeObjectURL(gcashQrCode);
                    }
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all duration-200 active:scale-90"
                >
                  <span className="text-2xl font-bold">×</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8 space-y-6">
              {/* Total Amount */}
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800/50">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Total Amount</p>
                <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                  ₱{finalTotal.toFixed(2)}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-6 rounded-2xl bg-white dark:bg-stone-800 border-4 border-blue-500 dark:border-blue-600 shadow-xl">
                  {gcashQrCode ? (
                    <img src={gcashQrCode} alt="GCash QR Code" className="w-64 h-64 object-contain" />
                  ) : (
                    <div className="w-64 h-64 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                        </svg>
                        <p className="text-sm text-stone-600 dark:text-stone-400">Generating QR code...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3 text-center">
                <p className="text-sm font-bold text-stone-900 dark:text-white">Scan this QR code with your GCash app</p>
                <div className="flex items-center justify-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span>Reference: {gcashReference}</span>
                </div>
                <div className="mt-3 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800/50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 dark:text-blue-400" />
                      <p className="text-xs text-blue-900 dark:text-blue-300 font-bold">
                        How to complete payment:
                      </p>
                    </div>
                    <ol className="text-xs text-blue-800 dark:text-blue-400 space-y-1 text-left list-decimal list-inside">
                      <li>Click <span className="font-semibold">"Open GCash Payment Page"</span> button below</li>
                      <li>On PayMongo page, click <span className="font-semibold">"Authorize Test Payment"</span></li>
                      <li className="font-semibold text-green-700 dark:text-green-400">Purchase completes automatically via webhook! ✨</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              {gcashPaymentStatus !== 'pending' && (
                <div className={`p-4 rounded-xl border-2 ${
                  gcashPaymentStatus === 'authorized' || gcashPaymentStatus === 'chargeable'
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800/50'
                    : gcashPaymentStatus === 'cancelled' || gcashPaymentStatus === 'expired' || gcashPaymentStatus === 'failed'
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800/50'
                    : 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800/50'
                }`}>
                  <p className={`text-sm font-bold ${
                    gcashPaymentStatus === 'authorized' || gcashPaymentStatus === 'chargeable'
                      ? 'text-green-700 dark:text-green-400'
                      : gcashPaymentStatus === 'cancelled' || gcashPaymentStatus === 'expired' || gcashPaymentStatus === 'failed'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-blue-700 dark:text-blue-400'
                  }`}>
                    {gcashPaymentStatus === 'authorized' || gcashPaymentStatus === 'chargeable' ? '✅ Payment Authorized!' :
                     gcashPaymentStatus === 'cancelled' ? '❌ Payment Cancelled' :
                     gcashPaymentStatus === 'expired' ? '⏱️ Payment Expired' :
                     gcashPaymentStatus === 'failed' ? '❌ Payment Failed' :
                     `Status: ${gcashPaymentStatus}`}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={gcashCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faBolt} className="text-xl" />
                    <span>Open GCash Payment Page</span>
                  </div>
                </a>
                
                {/* Waiting indicator */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800/50">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-300">
                      Waiting for payment authorization...
                    </p>
                  </div>
                  <p className="text-xs text-center text-blue-700 dark:text-blue-400">
                    After authorizing in GCash, your purchase will automatically complete
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setShowGCashModal(false);
                    setGcashPaymentStatus('pending');
                    if (gcashQrCode) {
                      URL.revokeObjectURL(gcashQrCode);
                    }
                    // Clear stored data
                    localStorage.removeItem(`gcash_payment_${gcashReference}`);
                  }}
                  className="w-full px-6 py-4 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-white font-black transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Size Selection Modal */}
      {showSizeModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md mx-4 bg-stone-50 dark:bg-stone-900 rounded-2xl shadow-2xl border-2 border-orange-500 dark:border-orange-600 overflow-hidden animate-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -mr-16 -mt-16"></div>
              </div>
              <div className="relative">
                <h3 className="text-2xl font-black text-white">Select Size</h3>
                <p className="text-sm text-orange-100 mt-1">{selectedProduct.name}</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              {/* Product Image */}
              {selectedProduct.image && (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-stone-700 dark:to-stone-800">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Size Options */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-stone-900 dark:text-white">Choose your size:</p>
                <div className="space-y-2">
                  {selectedProduct.sizes?.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => {
                        setSelectedSizeForAdd(size.size);
                        setSelectedSizeIdForAdd(size.id);
                        setSelectedPriceForAdd(size.price);
                      }}
                      disabled={!size.isAvailable}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedSizeForAdd === size.size
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 shadow-lg shadow-orange-500/20'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-orange-300 dark:hover:border-orange-600'
                      } ${
                        !size.isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className={`font-bold ${
                            selectedSizeForAdd === size.size
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-stone-900 dark:text-white'
                          }`}>
                            {size.size}
                          </p>
                          {!size.isAvailable && (
                            <p className="text-xs text-red-500">Unavailable</p>
                          )}
                        </div>
                        <p className={`text-xl font-black ${
                          selectedSizeForAdd === size.size
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-stone-700 dark:text-stone-300'
                        }`}>
                          ₱{size.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowSizeModal(false);
                    setSelectedProduct(null);
                    setSelectedSizeForAdd('');
                    setSelectedSizeIdForAdd(null);
                    setSelectedPriceForAdd(0);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-white font-bold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToCartWithSize}
                  disabled={!selectedSizeForAdd}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-stone-400 disabled:to-stone-400 text-white font-bold transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-orange-500/30"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sugar Level Modal */}
      {showSugarLevelModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-md border-2 border-orange-200 dark:border-orange-900 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
              <div className="relative">
                <h3 className="text-2xl font-black text-white">Select Sugar Level</h3>
                <p className="text-sm text-orange-100 mt-1">{selectedProduct.name} - {selectedSizeForAdd}</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              {/* Sugar Level Options */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-stone-900 dark:text-white">Choose your sugar level:</p>
                <div className="space-y-2">
                  {['100%', '75%', '50%', '25%', '0%'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedSugarLevel(level)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedSugarLevel === level
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 shadow-lg shadow-orange-500/20'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-orange-300 dark:hover:border-orange-600'
                      } cursor-pointer`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className={`font-bold ${
                            selectedSugarLevel === level
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-stone-900 dark:text-white'
                          }`}>
                            {level === '100%' ? 'Regular (100%)' : 
                             level === '75%' ? 'Less Sweet (75%)' :
                             level === '50%' ? 'Half Sweet (50%)' :
                             level === '25%' ? 'Light Sweet (25%)' :
                             'No Sugar (0%)'}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            {level === '100%' ? 'Full sweetness' : 
                             level === '0%' ? 'No added sugar' :
                             `${level} of regular sweetness`}
                          </p>
                        </div>
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                          selectedSugarLevel === level
                            ? 'bg-orange-500 text-white'
                            : 'bg-stone-100 dark:bg-stone-700 text-stone-400'
                        } transition-all duration-200`}>
                          <span className="text-xl font-black">{level}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowSugarLevelModal(false);
                    setShowSizeModal(true); // Go back to size selection
                  }}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-white font-bold transition-all duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleAddToCartWithSizeAndSugar}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-orange-500/30"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Payment Modal */}
      {showCashPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 px-8 py-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-300 rounded-full blur-2xl -ml-16 -mb-16"></div>
              </div>
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30">
                  <FontAwesomeIcon icon={faMoneyBill} className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Cash Payment</h3>
                  <p className="text-sm text-orange-100 mt-0.5">Enter amount received</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-5">
              {/* Total Amount Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-orange-900/20 p-5 border border-orange-200 dark:border-orange-800/30">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-300/20 rounded-full blur-2xl -mr-12 -mt-12"></div>
                <div className="relative">
                  <p className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-2">Total Amount Due</p>
                  <p className="text-4xl font-black text-orange-600 dark:text-orange-400 tracking-tight">
                    ₱{(() => {
                      const discountValue = typeof selectedDiscount === 'number' ? selectedDiscount : (selectedDiscount ? parseFloat(selectedDiscount as string) : 0);
                      const discountAmount = (total * discountValue) / 100;
                      const taxRate = 12;
                      const taxAmount = (total * taxRate) / 100;
                      return (total + taxAmount - discountAmount).toFixed(2);
                    })()}
                  </p>
                </div>
              </div>

              {/* Amount Paid Input */}
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                  <FontAwesomeIcon icon={faMoneyBill} className="h-4 w-4 text-orange-500" />
                  Amount Paid
                </label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-stone-400 dark:text-stone-500 group-focus-within:text-orange-500 transition-colors">₱</span>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAmountPaid(value);
                      const paid = parseFloat(value) || 0;
                      const discountValue = typeof selectedDiscount === 'number' ? selectedDiscount : (selectedDiscount ? parseFloat(selectedDiscount as string) : 0);
                      const discountAmount = (total * discountValue) / 100;
                      const taxRate = 12;
                      const taxAmount = (total * taxRate) / 100;
                      const finalTotal = total + taxAmount - discountAmount;
                      const change = paid - finalTotal;
                      setChangeAmount(change > 0 ? change : 0);
                    }}
                    placeholder="0.00"
                    className="w-full pl-16 pr-5 py-5 text-3xl font-black rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-300 dark:placeholder:text-stone-600 focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faBolt} className="h-3 w-3 text-orange-500" />
                  Quick Select
                </p>
                <div className="grid grid-cols-4 gap-2.5">
                  {[100, 200, 500, 1000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setAmountPaid(amount.toString());
                        const discountValue = typeof selectedDiscount === 'number' ? selectedDiscount : (selectedDiscount ? parseFloat(selectedDiscount as string) : 0);
                        const discountAmount = (total * discountValue) / 100;
                        const taxRate = 12;
                        const taxAmount = (total * taxRate) / 100;
                        const finalTotal = total + taxAmount - discountAmount;
                        const change = amount - finalTotal;
                        setChangeAmount(change > 0 ? change : 0);
                      }}
                      className="group relative overflow-hidden px-4 py-3.5 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-base font-bold text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all hover:scale-105 active:scale-95"
                    >
                      <span className="relative z-10">₱{amount}</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-orange-600/0 group-hover:from-orange-400/5 group-hover:to-orange-600/5 transition-all"></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Amount */}
              {amountPaid && parseFloat(amountPaid) > 0 && (
                <div className={`relative overflow-hidden rounded-2xl p-5 border-2 transition-all animate-in slide-in-from-top-2 duration-200 ${
                  changeAmount >= 0 
                    ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20 border-emerald-300 dark:border-emerald-800/30' 
                    : 'bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 dark:from-rose-950/20 dark:via-red-950/20 dark:to-pink-950/20 border-rose-300 dark:border-rose-800/30'
                }`}>
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-12 -mt-12 ${
                    changeAmount >= 0 ? 'bg-emerald-300/30' : 'bg-rose-300/30'
                  }`}></div>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <FontAwesomeIcon 
                        icon={changeAmount >= 0 ? faCheckCircle : faExclamationTriangle} 
                        className={`h-4 w-4 ${
                          changeAmount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      />
                      <p className={`text-xs font-bold uppercase tracking-wider ${
                        changeAmount >= 0 
                          ? 'text-emerald-700 dark:text-emerald-400' 
                          : 'text-rose-700 dark:text-rose-400'
                      }`}>
                        {changeAmount >= 0 ? 'Customer Change (Sukli)' : 'Insufficient Payment'}
                      </p>
                    </div>
                    <p className={`text-4xl font-black tracking-tight ${
                      changeAmount >= 0 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      ₱{Math.abs(changeAmount).toFixed(2)}
                    </p>
                    {changeAmount >= 0 && changeAmount > 0 && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                        Return to customer
                      </p>
                    )}
                    {changeAmount < 0 && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
                        Need ₱{Math.abs(changeAmount).toFixed(2)} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => {
                    setShowCashPaymentModal(false);
                    setAmountPaid('');
                    setChangeAmount(0);
                  }}
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold transition-all duration-200 hover:border-stone-300 dark:hover:border-stone-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const discountValue = typeof selectedDiscount === 'number' ? selectedDiscount : (selectedDiscount ? parseFloat(selectedDiscount as string) : 0);
                    const discountAmount = (total * discountValue) / 100;
                    const taxRate = 12;
                    const taxAmount = (total * taxRate) / 100;
                    const finalTotal = total + taxAmount - discountAmount;
                    const paid = parseFloat(amountPaid) || 0;
                    
                    if (paid >= finalTotal) {
                      setShowCashPaymentModal(false);
                      handleCompletePurchase('Cash');
                      setAmountPaid('');
                      setChangeAmount(0);
                    }
                  }}
                  disabled={!amountPaid || parseFloat(amountPaid) < (() => {
                    const discountValue = typeof selectedDiscount === 'number' ? selectedDiscount : (selectedDiscount ? parseFloat(selectedDiscount as string) : 0);
                    const discountAmount = (total * discountValue) / 100;
                    const taxRate = 12;
                    const taxAmount = (total * taxRate) / 100;
                    return total + taxAmount - discountAmount;
                  })()}
                  className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-stone-300 disabled:to-stone-400 dark:disabled:from-stone-700 dark:disabled:to-stone-600 text-white font-bold transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-orange-500/30 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                >
                  Complete Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {showPaymentSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md mx-4 bg-stone-50 dark:bg-stone-900 rounded-2xl shadow-2xl border-2 border-green-500 dark:border-green-600 overflow-hidden animate-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -mr-16 -mt-16"></div>
              </div>
              <div className="relative text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 animate-bounce">
                    <FontAwesomeIcon icon={faCheck} className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white">Payment Successful!</h3>
                <p className="text-sm text-green-100 mt-1">Your GCash payment has been processed</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8 space-y-6">
              <div className="text-center space-y-4">
                {/* Success Icon Animation */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-4 border-green-500 dark:border-green-600">
                      <FontAwesomeIcon icon={faCheck} className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-2">
                  <p className="text-lg font-bold text-stone-900 dark:text-white">
                    Thank you for your payment!
                  </p>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    Your transaction has been completed successfully.
                  </p>
                </div>

                {/* Amount */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800/50">
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Amount Paid</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-green-500 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
                    ₱{finalTotal.toFixed(2)}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowPaymentSuccessModal(false);
                  }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPanel;
