import { Star } from 'lucide-react'

export function StarRating({ rating, size = 'md', fillColor = 'gold', showValue = true }) {
  const sizeMap = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5', xl: 'w-6 h-6' }
  const sizeClass = sizeMap[size] || sizeMap.md
  
  return (
    <div className="flex items-center gap-1">
      {Array(5).fill(0).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i < rating ? `fill-${fillColor} text-${fillColor}` : 'text-gray-300'}`}
        />
      ))}
      {showValue && <span className="text-xs text-gray-600 ml-1">{rating}/5</span>}
    </div>
  )
}

export function ReviewCard({ name, rating, comment, source = 'manual', avatar = null, compact = false }) {
  const sourceLabels = {
    facebook: '📘 فيسبوك',
    instagram: '📷 إنستاجرام',
    whatsapp: '💬 واتساب',
    google: '🔍 جوجل',
    manual: '⭐ تقييم',
  }

  const sourceColors = {
    facebook: 'bg-blue-100 text-blue-700',
    instagram: 'bg-pink-100 text-pink-700',
    whatsapp: 'bg-green-100 text-green-700',
    google: 'bg-yellow-100 text-yellow-700',
    manual: 'bg-gold/20 text-gold',
  }

  if (compact) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex gap-1 mb-2">
          {Array(rating).fill(0).map((_, j) => (
            <Star key={j} className="w-3 h-3 fill-gold text-gold" />
          ))}
        </div>
        <p className="text-white/70 text-xs leading-relaxed mb-3">{comment}</p>
        <div className="flex items-center justify-between">
          <p className="font-semibold text-xs">{name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${sourceColors[source] || 'bg-gray-200 text-gray-700'}`}>
            {sourceLabels[source]}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
      <div className="flex gap-1 mb-4">
        {Array(rating).fill(0).map((_, j) => (
          <Star key={j} className="w-4 h-4 fill-gold text-gold" />
        ))}
      </div>
      <p className="text-white/80 text-sm leading-relaxed mb-5">"{comment}"</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center text-gold font-bold text-sm">
              {name[0]}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-white">{name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${sourceColors[source] || 'bg-gray-600 text-gray-200'}`}>
              {sourceLabels[source]}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
