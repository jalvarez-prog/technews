interface AdSpaceProps {
  width: number;
  height: number;
  className?: string;
}

export function AdSpace({ width, height, className = '' }: AdSpaceProps) {
  const isVertical = height > width;
  
  return (
    <div
      className={`bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, minWidth: `${width}px` }}
    >
      <div className={`text-center p-4 ${isVertical ? 'writing-mode-vertical' : ''}`}>
        <div className="text-gray-400 dark:text-gray-500 text-sm font-medium mb-1">
          Espacio Publicitario
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-xs">
          {width} × {height}
        </div>
      </div>
    </div>
  );
}
