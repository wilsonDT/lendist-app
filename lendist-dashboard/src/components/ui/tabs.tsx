import * as React from "react";
import { cn } from "../../lib/utils";

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ defaultValue, value, onValueChange, children }) => {
  const [selectedTab, setSelectedTab] = React.useState<string>(defaultValue || "");
  
  React.useEffect(() => {
    if (value) {
      setSelectedTab(value);
    }
  }, [value]);
  
  const handleTabChange = (tabValue: string) => {
    setSelectedTab(tabValue);
    if (onValueChange) {
      onValueChange(tabValue);
    }
  };
  
  const contextValue = React.useMemo(() => {
    return {
      selectedTab: value !== undefined ? value : selectedTab,
      onTabChange: handleTabChange,
    };
  }, [selectedTab, value, handleTabChange]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsContextProps {
  selectedTab: string;
  onTabChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextProps | undefined>(undefined);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs component");
  }
  return context;
};

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TabsList: React.FC<TabsListProps> = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-secondary p-1 text-secondary-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className, ...props }) => {
  const { selectedTab, onTabChange } = useTabsContext();
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        selectedTab === value ? 
          "bg-background text-foreground shadow-sm" : 
          "text-muted-foreground hover:bg-secondary/80",
        className
      )}
      onClick={() => onTabChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

const TabsContent: React.FC<TabsContentProps> = ({ value, children, className, ...props }) => {
  const { selectedTab } = useTabsContext();
  
  if (value !== selectedTab) return null;
  
  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent }; 