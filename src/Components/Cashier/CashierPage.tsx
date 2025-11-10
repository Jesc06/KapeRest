import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import MainPanel from './MainPanel.tsx';


interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
}

const CashierPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [userRole] = useState<string>('Cashier'); // Mock user role - can be fetched from auth/context

  // Mock product data
  const products = [
    { id: 1, name: 'Iced Latte', price: 120, category: 'Drinks', image: 'https://images.unsplash.com/photo-1518432031498-a3bae2b2b2d5?w=300&h=300&fit=crop' },
    { id: 2, name: 'Iced Americano', price: 100, category: 'Drinks', image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=300&h=300&fit=crop' },
    { id: 3, name: 'Iced Macchiato', price: 130, category: 'Drinks', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=300&fit=crop' },
    { id: 4, name: 'Hot Espresso', price: 80, category: 'Drinks', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=300&h=300&fit=crop' },
    { id: 5, name: 'Milk Tea', price: 110, category: 'Drinks', image: 'https://images.unsplash.com/photo-1585518419759-87a89e9b339b?w=300&h=300&fit=crop' },
    { id: 6, name: 'Brown Sugar Milk Tea', price: 130, category: 'Drinks', image: 'https://images.unsplash.com/photo-1578668473245-8b891e02b484?w=300&h=300&fit=crop' },
    { id: 7, name: 'Chocolate Cake', price: 150, category: 'Food', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop' },
    { id: 8, name: 'Croissant', price: 90, category: 'Food', image: 'https://images.unsplash.com/photo-1585080195519-c21a5514f15f?w=300&h=300&fit=crop' },
    { id: 9, name: 'Sandwich', price: 180, category: 'Food', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop' },
    { id: 10, name: 'Cookie', price: 60, category: 'Snacks', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=300&fit=crop' },
    { id: 11, name: 'Donut', price: 70, category: 'Snacks', image: 'https://images.unsplash.com/photo-1631334932583-7acc2b0a1e32?w=300&h=300&fit=crop' },
    { id: 12, name: 'Pastry', price: 85, category: 'Snacks', image: 'https://images.unsplash.com/photo-1589080876485-3faf44f9cb31?w=300&h=300&fit=crop' },
  ];

  const categories = ['All', 'Drinks', 'Food', 'Snacks'];

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

export default CashierPage;
