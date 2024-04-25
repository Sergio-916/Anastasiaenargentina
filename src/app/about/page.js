"use client";
import { Heading, Box, LinkOverlay, Center, Flex } from "@chakra-ui/react";
import React from "react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import AboutCard from "../components/Cards/About/about";
import aboutInfo from "./about.info.json";

function SwipeAbout() {
  const photos = [
    "/about/about1.jpg",
    "/about/about2.jpg",
    "/about/about3.jpg",
    "/about/about4.jpg",
    "/about/about5.jpg",
    "/about/about6.jpg",
    "/about/about7.jpg",
    "/about/about8.jpg",
    "/about/about9.jpg",
  ];
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={50}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      onSwiper={(swiper) => console.log(swiper)}
      onSlideChange={() => console.log("slide change")}
    >
      {aboutInfo.info.map((item, index) => (
        <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center'}}>
          <AboutCard item={item} img={photos[index]} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
// export const metadata = {
//   title: "Обо мне",
//   description: "Анастасия Шимук - гид по Аргентине, гид по Буэнос Айресу, Экскурсии по Буэнос Айресу",
// };

function About() {
  return (
    <>
      <Heading my={5} textAlign="center">
        Обо мне
      </Heading>
      <Flex align={"center"} justify={"center"} zIndex={-1}>
        <SwipeAbout />
      </Flex>
    </>
  );
}

export default About;
