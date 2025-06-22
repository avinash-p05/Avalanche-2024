import React from 'react';
import { useDeptContext } from '../../context/DeptContext';
import './RadioBtn.css';

function RadioBtn({ name }) {
  const { deptStates, toggleDeptState } = useDeptContext();
  const isActive = deptStates.find((dept) => dept.name === name)?.isActive || false;

  return (
    <div className="dept-radio-container">
      <div className="dept-radio-wrapper">
        <input
          id={name}
          className="dept-radio-input"
          name="department"
          type="checkbox"
          onChange={() => toggleDeptState(name)}
          checked={isActive}
        />
        <div className="dept-radio-btn">
          <span aria-hidden=""></span>{name}
          <span className="dept-radio-btn__glitch" aria-hidden="">_{name}🦾</span>
          <label htmlFor={name} className={`dept-radio-number ${isActive ? 'active' : ''}`}>
            {name}
          </label>
        </div>
      </div>
    </div>
  );
}

export default RadioBtn;
