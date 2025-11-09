import React from "react";

interface TintedBackdropProps {
  className?: string;
}

const TintedBackdrop: React.FC<TintedBackdropProps> = ({ className }) => {
  const classes = ["tinted-backdrop", className].filter(Boolean).join(" ");

  return (
    <div aria-hidden className={classes}>
      <div className="tinted-backdrop__base" />
      <div className="tinted-backdrop__glow tinted-backdrop__glow--amber" />
      <div className="tinted-backdrop__glow tinted-backdrop__glow--sky" />
      <div className="tinted-backdrop__glow tinted-backdrop__glow--violet" />
    </div>
  );
};

export default TintedBackdrop;
