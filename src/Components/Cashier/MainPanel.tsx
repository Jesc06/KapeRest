import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faSearch, faPlus, faMinus, faTrash, faCheck, faPause, faCreditCard, faBars, faShoppingCart, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';

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
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
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
  userRole?: string;
  onAddToCart?: (product: Product) => void;
}

const MainPanel: React.FC<MainPanelProps> = ({
  cart,
  onRemoveFromCart,
  onUpdateQuantity,
  total,
  onBuy,
  onHold,
  onGCashPayment,
  isLoading,
  onToggleSidebar,
  sidebarExpanded = true,
  onToggleSidebarExpand,
  userRole = 'Cashier',
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

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      console.log('Adding to cart:', product);
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

      // Calculate discount and tax values
      const discountValue = typeof selectedDiscount === 'number' ? selectedDiscount : (selectedDiscount ? parseFloat(selectedDiscount as string) : 0);
      const taxRate = 12; // 12% tax

      // Process each cart item as a separate purchase
      const purchasePromises = cart.map(async (item) => {
        const purchaseData = {
          menuItemId: item.id,
          quantity: item.quantity,
          discountPercent: discountValue,
          tax: taxRate,
          paymentMethod: paymentMethod
        };

        console.log('Sending purchase request:', purchaseData);

        const response = await fetch(`${API_BASE_URL}/Buy/Buy`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(purchaseData)
        });

        // Get response text first
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        console.log('Response status:', response.status);

        if (!response.ok) {
          console.error('Purchase error response:', responseText);
          
          // Try to parse as JSON, fallback to plain text
          let errorMessage = responseText;
          try {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.message || errorJson.error || errorJson.title || responseText;
          } catch (e) {
            // If not JSON, use the plain text error
            errorMessage = responseText;
          }
          
          throw new Error(errorMessage || `Failed to purchase ${item.name}`);
        }

        // Parse successful response as JSON
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          console.warn('Response is not JSON:', responseText);
          result = { success: true, message: responseText };
        }
        
        console.log('Purchase successful for item:', item.name, result);
        return result;
      });

      // Wait for all purchases to complete
      await Promise.all(purchasePromises);

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
      }, 2000);

    } catch (err) {
      console.error('Error completing purchase:', err);
      setPurchaseError(err instanceof Error ? err.message : 'Failed to complete purchase. Please try again.');
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
    <div className={`flex h-screen w-full flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
      {/* Top Bar - Search & Filters */}
      <div className="sticky top-0 z-10 border-b border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 sm:px-8 md:px-10 py-5 shadow-sm transition-all duration-300">
        {/* Top Section: Sidebar Toggle | Search Bar | Logout Panel */}
        <div className="flex items-center justify-between gap-5 sm:gap-6">
          {/* Left & Center Section: Sidebar Toggle + Search Bar (ends where cart starts) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Hamburger Menu - Mobile Only */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>
            
            {/* Sidebar Toggle Button - Desktop Only */}
            <button
              onClick={onToggleSidebarExpand}
              className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
              title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>
          </div>

          {/* Center Section: Minimalist Search Bar - ends where cart begins */}
          <div className="flex-1 flex items-center gap-3 bg-stone-100 dark:bg-neutral-800 rounded-lg border border-stone-300 dark:border-neutral-700 px-4 py-3 shadow-sm transition-all duration-300 hover:shadow-md focus-within:shadow-md hover:border-stone-400 dark:hover:border-neutral-600">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="h-5 w-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search items..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 shadow-none focus:outline-none"
            />
          </div>

          {/* Right Section: Logout Panel - match cart width */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <LogoutPanel userRole={userRole} />
          </div>
        </div>
      </div>

      {/* Main Content Area - Proper padding and alignment */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden gap-6 px-6 sm:px-8 md:px-10 py-6 bg-gradient-to-br from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-800">
        {/* Left Section: Products & Filters - Main content area */}
        <div className="flex-1 flex flex-col gap-5 min-w-0 overflow-hidden">
          {/* Category Filter */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 px-6 py-6 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 dark:from-orange-500/5 dark:to-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30">
                  <FontAwesomeIcon icon={faCoffee} className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider text-stone-500 dark:text-stone-400 uppercase">Filter by</p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">Categories</p>
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
                        : 'border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:scale-105 active:scale-95'
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
          <div className="flex-1 flex flex-col rounded-xl border border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-stone-200 dark:border-neutral-800 bg-gradient-to-r from-stone-50 to-white dark:from-neutral-800 dark:to-neutral-900 px-6 py-5">
              <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
                <FontAwesomeIcon icon={faCoffee} className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                <span>Available Items</span>
                <span className="ml-auto font-semibold text-stone-600 dark:text-stone-400 text-sm bg-stone-100 dark:bg-neutral-800 px-3 py-1 rounded-full border border-stone-200 dark:border-neutral-700">({filteredProducts.length})</span>
              </h3>
            </div>

            {/* Products Grid (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-5 scroll-smooth">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
                    <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Loading menu items...</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 auto-rows-max" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleAddToCart(product)}
                      className="product-card-motion group cursor-pointer rounded-2xl border-2 border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-400 dark:hover:border-orange-500 active:scale-95 hover:-translate-y-2 overflow-hidden flex flex-col relative"
                    >
                      {/* Product Image */}
                      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-stone-100 dark:from-neutral-700 dark:via-neutral-750 dark:to-neutral-800">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-neutral-700 dark:to-neutral-600 group-hover:from-orange-100 group-hover:to-amber-200 dark:group-hover:from-neutral-650 dark:group-hover:to-neutral-550 transition-all duration-300">
                            <FontAwesomeIcon icon={faCoffee} className="h-12 w-12 text-orange-300 dark:text-orange-500/50" />
                          </div>
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          {product.category}
                        </div>
                      </div>

                      {/* Content - Bottom Section */}
                      <div className="flex-1 flex flex-col p-5 bg-gradient-to-b from-white to-stone-50/50 dark:from-neutral-800 dark:to-neutral-850/50">
                        <div className="flex-1 min-w-0 mb-4">
                          <h4 className="font-bold text-base leading-tight text-neutral-900 dark:text-white line-clamp-2 mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                            {product.name}
                          </h4>
                          {product.description && (
                            <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-2">
                              {product.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                            <div className="h-1 w-1 rounded-full bg-orange-500"></div>
                            <span className="font-medium">{product.category}</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-3 pt-4 border-t border-stone-200 dark:border-neutral-700">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider mb-0.5">Price</span>
                            <span className="text-xl font-black bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                              ₱{product.price}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="group/btn inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 dark:from-orange-500 dark:to-orange-400 dark:hover:from-orange-600 dark:hover:to-orange-500 p-3 text-white transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/50 active:scale-90 shadow-md hover:scale-110"
                          >
                            <FontAwesomeIcon icon={faPlus} className="h-4 w-4 group-hover/btn:rotate-90 transition-transform duration-300" />
                          </button>
                        </div>
                      </div>

                      {/* Shine Effect on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none"></div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex items-center justify-center py-24">
                    <div className="text-center">
                      <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800/30">
                        <FontAwesomeIcon icon={faSearch} className="h-9 w-9 text-orange-400 dark:text-orange-500" />
                      </div>
                      <p className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
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
        <div className="w-full lg:w-96 lg:min-w-[384px] xl:w-[420px] xl:min-w-[420px] flex flex-col rounded-2xl border-2 border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl shadow-stone-200/50 dark:shadow-neutral-800/50 overflow-hidden flex-shrink-0 h-full">
          {/* Cart Header - More breathing room */}
          <div className="border-b-2 border-stone-200 dark:border-neutral-700 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 dark:from-orange-600 dark:via-orange-700 dark:to-amber-700 px-6 py-5 flex-shrink-0 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl -ml-12 -mb-12"></div>
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                  <FontAwesomeIcon icon={faShoppingCart} className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Shopping Cart</h3>
                  <p className="text-sm text-orange-100 font-medium mt-0.5">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
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
                  className="cart-item-motion group flex flex-col gap-3 rounded-xl border-2 border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-white to-stone-50/50 dark:from-neutral-800 dark:to-neutral-850/50 p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-400 dark:hover:border-orange-500 relative overflow-hidden"
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
                      <p className="font-bold text-sm text-neutral-900 dark:text-white leading-tight mb-1.5 line-clamp-2">
                        {item.name}
                      </p>
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
                  <div className="relative flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-neutral-700">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 bg-white dark:bg-neutral-900 rounded-lg p-1 border-2 border-stone-200 dark:border-neutral-700 shadow-sm">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-md bg-stone-100 dark:bg-neutral-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-neutral-900 dark:text-white font-bold transition-all duration-200 active:scale-90 hover:text-orange-600 dark:hover:text-orange-400 border border-transparent hover:border-orange-300 dark:hover:border-orange-600"
                      >
                        <FontAwesomeIcon icon={faMinus} className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 min-w-[36px] text-center font-bold text-sm text-neutral-900 dark:text-white px-1">
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
                  <p className="text-base font-bold text-neutral-900 dark:text-white mb-2">
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
          <div className="flex-shrink min-h-0 border-t-2 border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-stone-50 via-white to-stone-50 dark:from-neutral-850 dark:via-neutral-900 dark:to-neutral-850 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-stone-200 dark:scrollbar-thumb-orange-600 dark:scrollbar-track-neutral-800">
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
                className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 group-hover:from-orange-200 group-hover:to-amber-200 dark:group-hover:from-orange-900/50 dark:group-hover:to-amber-900/50 transition-all duration-300">
                    <FontAwesomeIcon icon={faChevronDown} className={`h-4 w-4 text-orange-600 dark:text-orange-400 transition-transform duration-300 ${showTaxDiscount ? 'rotate-180' : ''}`} />
                  </div>
                  <span className="font-bold text-base text-neutral-900 dark:text-white">View Breakdown</span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/50">
                  <span className="text-xs font-black text-orange-600 dark:text-orange-400">{cart.reduce((sum, item) => sum + item.quantity, 0)} ITEMS</span>
                </div>
              </button>

              {/* Tax, Discount Details */}
              {showTaxDiscount && (
                <div className="space-y-4 pt-1 animate-in slide-in-from-top duration-300">
                  {/* Base Calculations */}
                  <div className="space-y-3 px-5 py-4 rounded-xl bg-stone-100 dark:bg-neutral-850 border border-stone-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between text-base">
                      <span className="font-semibold text-stone-600 dark:text-stone-400">Subtotal:</span>
                      <span className="font-bold text-neutral-900 dark:text-white">₱{total.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-stone-300 dark:bg-neutral-700"></div>
                    <div className="flex items-center justify-between text-base">
                      <span className="font-semibold text-stone-600 dark:text-stone-400">Tax (12%):</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">₱{(total * 0.12).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Custom Discount Section */}
                  <div className="px-5 py-4 rounded-xl bg-white dark:bg-neutral-900 border-2 border-stone-200 dark:border-neutral-700">
                    <label className="text-sm font-black text-orange-600 dark:text-orange-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                      Apply Discount
                    </label>
                    <select
                      value={selectedDiscount}
                      onChange={(e) => setSelectedDiscount(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full px-4 py-3.5 text-base bg-stone-50 dark:bg-neutral-850 border-2 border-stone-200 dark:border-neutral-700 rounded-xl font-bold text-neutral-900 dark:text-white hover:border-orange-400 dark:hover:border-orange-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
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
          <div className="flex-shrink-0 border-t-2 border-stone-200 dark:border-neutral-700 space-y-4 bg-gradient-to-b from-stone-100 to-stone-50 dark:from-neutral-850 dark:to-neutral-900 px-6 py-6">
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
              onClick={() => handleCompletePurchase('Cash')}
              disabled={processingPurchase || isLoading || cart.length === 0}
              className="group w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:via-orange-600 hover:to-amber-700 dark:from-orange-500 dark:via-orange-400 dark:to-amber-500 dark:hover:from-orange-600 dark:hover:via-orange-500 dark:hover:to-amber-600 px-6 py-5 text-lg font-black text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-orange-600 disabled:hover:via-orange-500 disabled:hover:to-amber-600 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-105 disabled:hover:scale-100 relative overflow-hidden"
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              
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

            {/* Secondary Actions - Grid Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Hold Button */}
              <button
                onClick={onHold}
                disabled={isLoading || cart.length === 0}
                className="group flex items-center justify-center gap-2.5 rounded-xl border-2 border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-gradient-to-br hover:from-stone-50 hover:to-stone-100 dark:hover:from-neutral-850 dark:hover:to-neutral-800 hover:border-orange-400 dark:hover:border-orange-500 px-5 py-4 text-base font-black text-neutral-900 dark:text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
              >
                <FontAwesomeIcon icon={faPause} className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Hold</span>
              </button>

              {/* GCash Payment Button */}
              <button
                onClick={() => handleCompletePurchase('GCash')}
                disabled={processingPurchase || isLoading || cart.length === 0}
                className="group flex items-center justify-center gap-2.5 rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-5 py-4 text-base font-black text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 disabled:hover:scale-100 relative overflow-hidden"
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                
                <FontAwesomeIcon icon={faCreditCard} className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform" />
                <span className="relative z-10">GCash</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPanel;
