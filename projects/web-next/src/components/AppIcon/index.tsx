import { useState } from "react";
import styles from "./index.module.scss";

const isUrl = (str: string) => str.startsWith("http://") || str.startsWith("https://");

interface AppIconProps {
  icon: string;
  color: string;
  name: string;
}

function getGlyph(icon: string, name: string): string {
  if (!icon) return name.charAt(0).toUpperCase();
  if (isUrl(icon)) return name.charAt(0).toUpperCase();
  return icon;
}

export const AppIcon = ({ icon, color, name }: AppIconProps) => {
  const [showFallback, setShowFallback] = useState(false);

  if (isUrl(icon) && !showFallback) {
    return (
      <div className={styles.appIcon} style={{ background: color }}>
        <img
          src={icon}
          alt={name}
          className={styles.iconImage}
          onError={() => setShowFallback(true)}
        />
      </div>
    );
  }

  return (
    <div className={styles.appIcon} style={{ background: color }}>
      <span>{getGlyph(icon, name)}</span>
    </div>
  );
};
