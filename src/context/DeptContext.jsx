import React, { createContext, useContext, useState } from 'react';

const DeptContext = createContext();

export const useDeptContext = () => useContext(DeptContext);

export const DeptProvider = ({ children }) => {
  const [deptStates, setDeptStates] = useState([]);

  const toggleDeptState = (name) => {
    setDeptStates((prevStates) => {
      if (name === 'All') {
        const allIsActive = !prevStates.find((dept) => dept.name === 'All')?.isActive;
        return prevStates.map((dept) => ({ ...dept, isActive: allIsActive }));
      } else {
        const updatedStates = prevStates.map((dept) =>
          dept.name === name ? { ...dept, isActive: !dept.isActive } : dept
        );

        const allOtherActive = updatedStates
          .filter((dept) => dept.name !== 'All')
          .every((dept) => dept.isActive);

        return updatedStates.map((dept) =>
          dept.name === 'All' ? { ...dept, isActive: allOtherActive } : dept
        );
      }
    });
  };

  return (
    <DeptContext.Provider value={{ deptStates, setDeptStates, toggleDeptState }}>
      {children}
    </DeptContext.Provider>
  );
};
