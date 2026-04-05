// components/admin/AdminHeader.tsx
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Bell, 
  Search, 
  User, 
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  Home,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export default function AdminHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Order Received',
      message: 'Order #ORD-001 for $199.99',
      time: '5 min ago',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Low Stock Alert',
      message: 'Wireless Earbuds Pro has only 5 units left',
      time: '1 hour ago',
      read: false,
      type: 'warning'
    },
    {
      id: '3',
      title: 'New User Registered',
      message: 'John Doe registered to your store',
      time: '2 hours ago',
      read: true,
      type: 'info'
    },
    {
      id: '4',
      title: 'System Update Available',
      message: 'Version 2.1.0 is ready to install',
      time: '1 day ago',
      read: true,
      type: 'info'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Left Section - Search */}
          <div className="flex flex-1 items-center">
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products, orders, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hidden sm:block">
                  Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">⌘K</kbd>
                </div>
              </div>
            </form>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-4">
            
            {/* Store View Link */}
            <Link 
              href="/" 
              target="_blank"
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>View Store</span>
            </Link>

            {/* Analytics Link */}
            <Link 
              href="/admin/analytics" 
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Link>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="h-auto py-0 text-xs"
                    >
                      Mark all as read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id}
                        className={`flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50 ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex items-start w-full gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                            {notification.type === 'success' && '✓'}
                            {notification.type === 'warning' && '⚠'}
                            {notification.type === 'error' && '✕'}
                            {notification.type === 'info' && 'i'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm text-gray-900 truncate">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-blue-600 hover:text-blue-800">
                  <Link href="/admin/notifications" className="w-full text-center">
                    View all notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings */}
            <Link href="/admin/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={session?.user?.image || ''} 
                      alt={session?.user?.name || 'Admin'}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {session?.user?.name ? getInitials(session.user.name) : 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {session?.user?.name || 'Admin User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session?.user?.email || 'admin@example.com'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name || 'Admin User'}
                    </p>
                    <p className="text-xs leading-none text-gray-500">
                      {session?.user?.email || 'admin@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="flex items-center justify-around px-4 py-2">
          <Link 
            href="/" 
            target="_blank"
            className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Store</span>
          </Link>
          
          <Link 
            href="/admin/analytics" 
            className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs mt-1">Stats</span>
          </Link>
          
          <Link 
            href="/admin/notifications" 
            className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            <span className="text-xs mt-1">Alerts</span>
          </Link>
          
          <Link 
            href="/admin/settings" 
            className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </header>
  );
}