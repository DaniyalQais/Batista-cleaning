import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
  duration = 0.6,
}: AnimatedCounterProps) {
  const spring = useSpring(0, { stiffness: 80, damping: 20, mass: 0.8 });
  const display = useTransform(spring, (v) => {
    const formatted = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
    return `${prefix}${formatted}${suffix}`;
  });
  const [text, setText] = useState(`${prefix}${decimals > 0 ? value.toFixed(decimals) : Math.round(value)}${suffix}`);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      spring.jump(value);
      return;
    }
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = display.on('change', (v) => setText(v));
    return unsub;
  }, [display]);

  return (
    <motion.span
      className={className}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration * 0.3 }}
    >
      {text}
    </motion.span>
  );
}
