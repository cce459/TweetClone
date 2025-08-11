import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  onTweetClick: () => void;
}

export function Sidebar({ onTweetClick }: SidebarProps) {
  const [location] = useLocation();
  const { setTheme, theme } = useTheme();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user/me"],
  });

  const navItems = [
    { icon: "fas fa-home", label: "Home", path: "/" },
    { icon: "fas fa-search", label: "Explore", path: "/explore" },
    { icon: "fas fa-bell", label: "Notifications", path: "/notifications" },
    { icon: "fas fa-envelope", label: "Messages", path: "/messages" },
    { icon: "fas fa-bookmark", label: "Bookmarks", path: "/bookmarks" },
    { icon: "fas fa-user", label: "Profile", path: "/profile" },
    { icon: "fas fa-ellipsis-h", label: "More", path: "/more" },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 lg:w-72 bg-white dark:bg-black border-r border-twitter-extra-light-gray dark:border-gray-800 z-50 lg:relative lg:block hidden">
      <div className="p-4 space-y-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <i className="fab fa-twitter text-3xl text-twitter-blue"></i>
          <span className="text-xl font-bold text-twitter-black dark:text-white">Twitter Clone</span>
        </div>
        
        {/* Navigation Menu */}
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a className={cn(
                  "flex items-center space-x-3 p-3 rounded-full transition-colors font-medium",
                  location === item.path
                    ? "text-twitter-black dark:text-white bg-twitter-extra-light-gray dark:bg-gray-900"
                    : "text-twitter-dark-gray dark:text-gray-400 hover:bg-twitter-extra-light-gray dark:hover:bg-gray-900"
                )}>
                  <i className={`${item.icon} text-xl w-6`}></i>
                  <span>{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className="flex items-center space-x-3 p-3 rounded-full w-full justify-start text-twitter-dark-gray dark:text-gray-400 hover:bg-twitter-extra-light-gray dark:hover:bg-gray-900"
        >
          <i className={`fas fa-${theme === "dark" ? "sun" : "moon"} text-xl w-6`}></i>
          <span>{theme === "dark" ? "Light" : "Dark"} Mode</span>
        </Button>
        
        {/* Tweet Button */}
        <Button
          onClick={onTweetClick}
          className="w-full bg-twitter-blue hover:bg-twitter-dark-blue text-white font-bold py-3 px-6 rounded-full transition-colors duration-200"
        >
          Tweet
        </Button>
        
        {/* User Profile */}
        {currentUser && (
          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-twitter-extra-light-gray dark:hover:bg-gray-900 cursor-pointer transition-colors mt-auto">
            <Avatar className="w-10 h-10">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 hidden lg:block">
              <p className="font-bold text-sm text-twitter-black dark:text-white">{currentUser.name}</p>
              <p className="text-sm text-twitter-dark-gray dark:text-gray-400">@{currentUser.username}</p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
