import React from 'react';
import PropTypes from 'prop-types';

const CustomButton = ({
  btntype = 'button',
  title,
  handleClick = () => {},
  styles = '',
  disabled = false,
  ariaLabel = title // Use title as a fallback for aria-label
}) => {
  return (
    <button
      type={btntype}
      className={`font-epilogue font-semibold text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px] ${styles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={ariaLabel} // Improved accessibility
    >
      {title}
    </button>
  );
};

CustomButton.propTypes = {
  btntype: PropTypes.oneOf(['button', 'submit', 'reset']),
  title: PropTypes.string.isRequired,
  handleClick: PropTypes.func,
  styles: PropTypes.string,
  disabled: PropTypes.bool,
  ariaLabel: PropTypes.string, // Add ariaLabel to prop types
};

export default CustomButton;
