import { useState } from 'react';
import './ImageWithPlaceholder.css';

/**
 * ImageWithPlaceholder - shows a shimmer skeleton while the image loads,
 * then fades in the real image. Supports native lazy loading.
 */
export default function ImageWithPlaceholder({
  src,
  alt,
  className = '',
  loading = 'lazy',
  aspectRatio,
  onLoad,
  onError,
  ...rest
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true); // hide skeleton on error too
    onError?.();
  };

  return (
    <div
      className="img-placeholder-wrapper"
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Shimmer skeleton — hidden once image is loaded */}
      {!isLoaded && !hasError && (
        <div className="img-skeleton" aria-hidden="true" />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="img-error" aria-label="Image failed to load">
          <span className="img-error-icon">⚠</span>
        </div>
      )}

      {/* Actual image */}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={`img-placeholder-img ${isLoaded ? 'img-loaded' : 'img-loading'} ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          {...rest}
        />
      )}
    </div>
  );
}
