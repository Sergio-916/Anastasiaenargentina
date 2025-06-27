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
    "/about_photos/about1.jpg",
    "/about_photos/about2.jpg",
    "/about_photos/about3.jpg",
    "/about_photos/about4.jpg",
    "/about_photos/about5.jpg",
    "/about_photos/about6.jpg",
    "/about_photos/about7.jpg",
    "/about_photos/about8.jpg",
    "/about_photos/about9.jpg",
  ];
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={50}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      scrollbar={false}
      // onSwiper={(swiper) => console.log(swiper)}
      // onSlideChange={() => console.log("slide change")}
    >
      {aboutInfo.info.map((item, index) => (
        <SwiperSlide
          key={index}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <AboutCard item={item} img={photos[index]} index={index} />
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
      <Flex align={"center"} justify={"center"} zIndex={-1}mb={10}>
        <SwipeAbout />
      </Flex>
    </>
  );
}

export default About;
