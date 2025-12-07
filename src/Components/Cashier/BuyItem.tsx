import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import MainPanel from './MainPanel.tsx';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  image: string;
  selectedSize?: string;
  selectedSizeId?: number;
  selectedPrice?: number;
  sugarLevel?: string;
}

const BuyItem: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // ✅ Load resume cart from sessionStorage on component mount
  useEffect(() => {
    const resumeCartData = sessionStorage.getItem('resumeCart');
    const resumeDiscountData = sessionStorage.getItem('resumeDiscount');
    
    if (resumeCartData) {
      try {
        const parsedCart = JSON.parse(resumeCartData);
        console.log('📦 Loading resumed cart:', parsedCart);
        
        // Set cart with resumed items
        setCart(parsedCart);
        
        // Log discount info (can be used by MainPanel if needed)
        if (resumeDiscountData) {
          console.log('💰 Resume discount:', resumeDiscountData + '%');
        }
        
        // Clean up sessionStorage
        sessionStorage.removeItem('resumeCart');
        sessionStorage.removeItem('resumeDiscount');
        sessionStorage.removeItem('resumeTax');
        
        console.log('✅ Cart resumed successfully with', parsedCart.length, 'items');
      } catch (error) {
        console.error('❌ Error loading resume cart:', error);
      }
    }
  }, []);

  // Add item to cart - handle size variations
  const handleAddToCart = (product: { id: number; name: string; price: number; category: string; description: string; image: string; selectedSize?: string; selectedSizeId?: number; selectedPrice?: number }) => {
    setCart(prevCart => {
      // Find existing item with same ID and size (if sizes are used)
      const existingItem = prevCart.find(item => 
        item.id === product.id && 
        (product.selectedSize ? item.selectedSize === product.selectedSize : !item.selectedSize)
      );
      
      if (existingItem) {
        return prevCart.map(item =>
          (item.id === product.id && 
           (product.selectedSize ? item.selectedSize === product.selectedSize : !item.selectedSize))
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Remove item from cart
  const handleRemoveFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Update item quantity
  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handle Buy
  const handleBuy = () => {
    if (cart.length === 0) {
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      console.log('Purchase completed:', cart);
      setCart([]);
      setIsLoading(false);
    }, 800);
  };

  // Handle Hold
  const handleHold = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    console.log('Cart held:', cart);
    alert('Cart has been saved temporarily');
  };

  // Handle GCash Payment
  const handleGCashPayment = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    console.log('GCash payment initiated for:', total);
    alert(`GCash payment initiated for ₱${total.toFixed(2)}`);
  };

  // Handle Logout
  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-stone-50 dark:bg-stone-900 text-neutral-900 transition-colors duration-300 dark:text-white overflow-hidden">
      
      <div aria-hidden className="absolute inset-0 z-0 bg-gradient-to-br from-stone-50 via-white to-stone-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 pointer-events-none" />

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Panel */}
        <MainPanel
          cart={cart}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          total={total}
          onBuy={handleBuy}
          onHold={handleHold}
          onGCashPayment={handleGCashPayment}
          isLoading={isLoading}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarExpanded={sidebarExpanded}
          onToggleSidebarExpand={() => setSidebarExpanded(!sidebarExpanded)}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
};

export default BuyItem;
