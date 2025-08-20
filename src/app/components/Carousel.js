import React from "react";
import Card from "./Cards/Card";
import cards from "./Cards/card.json";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

function MySwiperComponent() {
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      slidesPerView={1} // Количество слайдов для показа на маленьких экранах
      spaceBetween={30} // Расстояние между слайдами
      pagination={{ clickable: true }} // Добавляет пагинацию (точки внизу слайдера)
      navigation={true} // Добавляет кнопки "вперед" и "назад"
      autoplay={{ delay: 5000 }} // Автопроигрывание слайдов
      breakpoints={{
        // Когда ширина экрана >= 640px
        640: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        720: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        // Когда ширина экрана >= 768px
        820: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        1200: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
      }}
    >
      
        {cards.map((card, index) => (
          <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center'}}>
            {/* Ваш компонент элемента карусели, например: */}
            <Card
              key={card.id}
              img={card.img}
              content={card.content}
              title={card.title}
            />
          </SwiperSlide>
        ))}
      
    </Swiper>
  );
}

export default MySwiperComponent;
