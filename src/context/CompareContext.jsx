import React, { createContext, useState, useEffect } from "react";
import { soundService } from "../services/soundService";
import { safeLocalStorage } from "../utils/safeStorage";

export const CompareContext = createContext();

const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    return safeLocalStorage.getItem("compareList", []);
  });
  
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareToast, setCompareToast] = useState("");

  useEffect(() => {
    safeLocalStorage.setItem("compareList", compareList);
  }, [compareList]);

  const addToCompare = (product) => {
    if (compareList.some(p => p.id === product.id)) {
      setCompareToast("Product is already in the comparison list! ⚖️");
      soundService.playError();
      setTimeout(() => setCompareToast(""), 2000);
      return;
    }

    if (compareList.length >= 3) {
      setCompareToast("You can compare a maximum of 3 products! ⚖️");
      soundService.playError();
      setTimeout(() => setCompareToast(""), 2000);
      return;
    }

    setCompareList(prev => [...prev, product]);
    soundService.playPop();
    setCompareToast(`Added "${product.title.slice(0, 20)}..." to compare! ⚖️`);
    setTimeout(() => setCompareToast(""), 2000);
  };

  const removeFromCompare = (productId) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
    soundService.playTrash();
  };

  const clearCompare = () => {
    setCompareList([]);
    soundService.playTrash();
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        showCompareModal,
        setShowCompareModal,
        addToCompare,
        removeFromCompare,
        clearCompare,
        compareToast,
        setCompareToast
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export default CompareProvider;
