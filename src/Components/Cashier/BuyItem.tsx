import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import MainPanel from './MainPanel.tsx';
import { API_BASE_URL } from '../../config/api';

interface MenuItem {
  id: number;
  itemName: string;
  price: number;
  category: string;
  description: string;
  isAvailable: string;
  image: string | null; // base64 string or null
  cashierId: string;
  branchId: number | null;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
}

const BuyItem: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [userRole] = useState<string>('Cashier'); // Mock user role - can be fetched from auth/context
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [_error, setError] = useState<string | null>(null);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/MenuItem/GetAllMenuItems`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch menu items: ${response.status}`);
        }

        const data: MenuItem[] = await response.json();
        console.log('Menu items received:', data);
        setMenuItems(data.filter(item => item.isAvailable === 'true' || item.isAvailable === '1'));
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError(err instanceof Error ? err.message : 'Failed to load menu items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Convert MenuItem to product format for display
  const products = menuItems.map(item => ({
    id: item.id,
    name: item.itemName,
    price: Number(item.price),
    category: item.category,
    image: item.image ? `data:image/jpeg;base64,${item.image}` : 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop', // default coffee image
  }));

  // Get unique categories from menu items
  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))]

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchText, selectedCategory]);

  // Add item to cart
  const handleAddToCart = (product: typeof products[0]) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
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
      alert('Cart is empty');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      console.log('Purchase completed:', cart);
      alert('Purchase completed!');
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
    <div className="relative min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 transition-colors duration-300 dark:text-white overflow-hidden">
      
      <div aria-hidden className="absolute inset-0 z-0 bg-gradient-to-br from-stone-50 via-white to-stone-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 pointer-events-none" />

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Panel */}
        <MainPanel
          filteredProducts={filteredProducts}
          categories={categories}
          searchText={searchText}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchText}
          onCategoryChange={setSelectedCategory}
          onAddToCart={handleAddToCart}
          cart={cart}
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
          userRole={userRole}
        />
      </div>
    </div>
  );
};

export default BuyItem;
