import { useEffect, useRef, useState } from "react";
import { CountUp as CountUpJS } from "countup.js";

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
  preserveValue?: boolean;
  enableScrollSpy?: boolean;
  scrollSpyDelay?: number;
  onCompleteCallback?: () => void;
}

const CountUp: React.FC<CountUpProps> = ({
  end,
  start = 0,
  duration = 1.2,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  className = "",
  preserveValue = true,
  enableScrollSpy = false,
  scrollSpyDelay = 200,
  onCompleteCallback,
}) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const countUpRef = useRef<CountUpJS | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const initializeCountUp = () => {
    if (!elementRef.current) return;

    const options = {
      startVal: start,
      duration,
      decimalPlaces: decimals,
      separator,
      prefix,
      suffix,
      preserveValue,
      onCompleteCallback: () => {
        setHasAnimated(true);
        onCompleteCallback?.();
      },
    };

    countUpRef.current = new CountUpJS(elementRef.current, end, options);
    
    if (!enableScrollSpy) {
      countUpRef.current.start();
    }
  };

  useEffect(() => {
    if (enableScrollSpy && !hasAnimated) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && countUpRef.current && !hasAnimated) {
              setTimeout(() => {
                countUpRef.current?.start();
              }, scrollSpyDelay);
            }
          });
        },
        { threshold: 0.3 }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    } else if (!enableScrollSpy) {
      initializeCountUp();
    }
  }, [end, enableScrollSpy, hasAnimated, scrollSpyDelay]);

  useEffect(() => {
    if (countUpRef.current && hasAnimated && preserveValue) {
      countUpRef.current.update(end);
    } else if (!hasAnimated) {
      initializeCountUp();
    }
  }, [end, hasAnimated, preserveValue]);

  return <span ref={elementRef} className={className}></span>;
};

export { CountUp }; 