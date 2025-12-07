"use client";
import React from "react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Box, Image } from "@chakra-ui/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

function PhotoCarousel({
  photos,
  limitSize = ["300px", "350px", "400px"],
  customSlidePreview = "1",
}) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={30}
      slidesPerView={customSlidePreview}
      //navigation={true}
      pagination={{ clickable: true }}
      //   scrollbar={{ draggable: true }}
      onSwiper={(swiper) => console.log(swiper)}
      onSlideChange={() => console.log("slide change")}
      //autoplay={{ delay: 5000, disableOnInteraction: false }}
      loop={true}
      breakpoints={{
        // Когда ширина экрана >= 640px
        640: {
          slidesPerView: 1,
          spaceBetween: 30,
        },
        720: {
          slidesPerView: 1,
          spaceBetween: 30,
        },
        // Когда ширина экрана >= 768px
        900: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        1250: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      }}
    >
      {photos.map((photo, index) => (
        <SwiperSlide
          key={index}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Image src={photo} maxW={limitSize} borderRadius={5} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default PhotoCarousel;
