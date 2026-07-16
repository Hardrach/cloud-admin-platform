import React from 'react';
import { motion } from 'framer-motion';

export const PageTransition = ({ children }) => {
  return (
    <motion.div
      className="page-transition-wrapper"
      initial={{ opacity: 0, y: 18, scale: 0.985, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, scale: 0.99, filter: 'blur(6px)' }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
