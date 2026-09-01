import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadowColor?: 'black' | 'teal' | 'yellow' | 'pink' | 'green';
  borderWidth?: '2' | '3';
}

export const Card: React.FC<CardProps> = ({
  children,
  shadowColor = 'black',
  borderWidth = '2',
  className = '',
  ...props
}) => {
  const shadowClasses = {
    black: 'shadow-neo',
    teal: 'shadow-neo-teal',
    yellow: 'shadow-neo-yellow',
    pink: 'shadow-neo-pink',
    green: 'shadow-neo-green',
  };

  const borderClasses = {
    '2': 'border-2 border-black',
    '3': 'border-3 border-black',
  };

  return (
    <div
      className={`bg-white rounded-2xl ${borderClasses[borderWidth]} ${shadowClasses[shadowColor]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
