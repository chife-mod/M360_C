"use client";

/**
 * Pixel-perfect Brands Card component
 * Создан на основе стилей из Figma node-id: 277-1273
 * 
 * Стили из Figma:
 * - Размеры карточки: 187.25 x 130
 * - Заливка: #111539 (rgba(17, 21, 57, 1))
 * - Радиус скругления: 12px
 * - Padding: 24px со всех сторон
 * - Gap между элементами: 12px
 * - Layout: VERTICAL
 * - Обводка: градиент от rgba(255,255,255,0.2) до rgba(255,255,255,0.1)
 * - Иконка: 32x32 (Tabler Icons)
 * - Шрифт: Inter
 * 
 * Круги (ellipse):
 * - Ellipse 850: 92x92, rgba(255,255,255,0.14), blur 100, верхний левый угол
 * - Ellipse 849: 128x128, #46fec3, blur 100, нижний правый угол
 * - Ellipse 867: 12x12, круг в правом верхнем углу, 8px от правого края
 */

export function BrandsCard() {
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        width: '187.25px',
        height: '130px',
        backgroundColor: '#111539',
        borderRadius: '12px',
        padding: '24px',
        gap: '12px',
        border: '0.5px solid rgba(255, 255, 255, 0.1)',
        fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
      }}
    >
      {/* Ellipse 850 - верхний левый угол, 92x92, белый с 14% opacity, blur 100 */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '-30px',
          top: '-30px',
          width: '92px',
          height: '92px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.14)',
          filter: 'blur(100px)',
        }}
      />

      {/* Ellipse 849 - нижний правый угол, 128x128, зеленый, blur 100 */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: '-50px',
          bottom: '-50px',
          width: '128px',
          height: '128px',
          borderRadius: '50%',
          backgroundColor: '#46fec3',
          opacity: 0.14,
          filter: 'blur(100px)',
        }}
      />

      {/* Обводка с градиентом */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: '12px',
          padding: '0.5px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Иконка Tabler Icons - размер 32x32 */}
      <div className="relative flex items-center justify-center z-10" style={{ opacity: 0.4 }}>
        <img
          src="/assets/icons/brands-icon.svg"
          alt="Brands icon"
          style={{
            width: '32px',
            height: '32px',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Текст "Brands" - Inter font */}
      <span
        className="text-center font-medium leading-tight z-10"
        style={{
          fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
          fontSize: '13px',
          color: '#8b8ba7',
          letterSpacing: '0',
          lineHeight: '1.2',
          fontWeight: 500,
        }}
      >
        Brands
      </span>

      {/* Ellipse 867 - маленький круг в правом верхнем углу, 8px от правого края */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          right: '8px',
          top: '8px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      />
    </div>
  );
}
