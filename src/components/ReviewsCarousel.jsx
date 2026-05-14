import { useRef, useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, Keyboard } from 'swiper/modules'
import { ReviewCard } from './ReviewCard'
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export function ReviewsCarousel({ reviews, loading = false, error = null }) {
  const navigationPrevRef = useRef(null)
  const navigationNextRef = useRef(null)
  const swiperRef = useRef(null)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)

  useEffect(() => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.params.navigation.prevEl = navigationPrevRef.current
      swiperRef.current.swiper.params.navigation.nextEl = navigationNextRef.current
      swiperRef.current.swiper.navigation.init()
      swiperRef.current.swiper.navigation.update()
    }
  }, [])

  const handleSwipe = (swiper) => {
    setIsBeginning(swiper.isBeginning)
    setIsEnd(swiper.isEnd)
  }

  if (error) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-sm">حدث خطأ أثناء تحميل التقييمات</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-sm">لا توجد تقييمات متاحة حالياً</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Pagination, Autoplay, Keyboard]}
        slidesPerView={1}
        spaceBetween={24}
        autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true, el: '.reviews-pagination' }}
        keyboard={{ enabled: true }}
        loop={reviews.length > 3}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        onBeforeInit={(swiper) => {
          swiperRef.current = { swiper }
        }}
        onSlideChange={handleSwipe}
        onSwiper={handleSwipe}
        className="!pb-16"
      >
        {reviews.map((review) => (
          <SwiperSlide key={review.id} className="h-auto">
            <ReviewCard
              name={review.name}
              rating={review.rating}
              comment={review.comment}
              source={review.source}
              avatar={review.avatar}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      {reviews.length > 1 && (
        <div className="flex items-center justify-between mt-6 px-2 gap-2">
          <button
            ref={navigationPrevRef}
            disabled={isBeginning && !swiperRef.current?.swiper?.params.loop}
            className={`p-2.5 rounded-xl border transition-all ${
              isBeginning && !swiperRef.current?.swiper?.params.loop
                ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                : 'border-gold bg-gold/10 text-gold hover:bg-gold hover:text-white'
            }`}
            title="السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination */}
          <div className="reviews-pagination flex justify-center gap-1.5 !static !w-auto"></div>

          <button
            ref={navigationNextRef}
            disabled={isEnd && !swiperRef.current?.swiper?.params.loop}
            className={`p-2.5 rounded-xl border transition-all ${
              isEnd && !swiperRef.current?.swiper?.params.loop
                ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                : 'border-gold bg-gold/10 text-gold hover:bg-gold hover:text-white'
            }`}
            title="التالي"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      <style>{`
        .reviews-pagination {
          display: flex !important;
          gap: 0.5rem !important;
          justify-content: center !important;
          position: relative !important;
          width: 100% !important;
          margin-top: 0 !important;
        }
        .reviews-pagination .swiper-pagination-bullet {
          width: 8px !important;
          height: 8px !important;
          background: rgba(255, 215, 0, 0.3) !important;
          border-radius: 50% !important;
          opacity: 1 !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
        }
        .reviews-pagination .swiper-pagination-bullet-active {
          background: rgb(255, 215, 0) !important;
          width: 24px !important;
          border-radius: 4px !important;
        }
        .swiper-button-next.swiper-button-disabled,
        .swiper-button-prev.swiper-button-disabled {
          display: inline-flex !important;
        }
      `}</style>
    </div>
  )
}
