import "./style.css";
import { createClient } from "@supabase/supabase-js";
import { definitions } from "./types";

const supabase = createClient(
  "https://bipdlisatpyatmjjsltk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjk5NzM0MiwiZXhwIjoxOTQ4NTczMzQyfQ.2_lwVhhYP2ElztGEll8-GtcpUG8tvqbb7ZZsvso655k"
);

/**
 * Load product
 */

const productTitle = document.querySelector<HTMLHeadingElement>("h1")!;
const reviewsSection = document.querySelector<HTMLDivElement>("ul")!;

function getProducts() {
  return supabase.from<definitions["products"]>("products").select();
}
function getReviews() {
  return supabase.from<definitions["reviews"]>("reviews").select();
}

function generateReview(review: definitions["reviews"]) {
  const filledStars = [...Array(review.rating).keys()]
    .map((_i) => "★")
    .join("");
  const whiteStars = [...Array(5 - review.rating).keys()]
    .map((_i) => "☆")
    .join("");
  return `<li>${filledStars}${whiteStars}<strong>${review.rating}</strong>, ${review.review}</li>`;
}

async function fetchData() {
  const [{ data: products }, { data: reviews }] = await Promise.all([
    getProducts(),
    getReviews(),
  ]);
  if (!products) {
    productTitle.innerText = "Something went wrong 😢";
  } else {
    productTitle.innerText = products[0].name;
    if (reviews && reviews.length) {
      reviewsSection.innerHTML = reviews
        .map((review) => generateReview(review))
        .join("");
    }
  }
}

fetchData();

/**
 * Submit a review
 */

const form = document.querySelector<HTMLFormElement>("form")!;
form.addEventListener("submit", handleSubmit);

function serializeForm(form: HTMLFormElement): {
  review: string;
  rating: number;
} {
  const formData = new FormData(form);
  const values = {
    review: formData.get("review") as string,
    rating: Number(formData.get("rating")),
  };
  return values;
}

async function handleSubmit(event: Event) {
  event.preventDefault();
  const { review, rating } = serializeForm(form);
  // save review to DB
  const { data, error } = await supabase
    .from<definitions["reviews"]>("reviews")
    .insert([{ product_id: 1, review, rating }]);
  if (error) {
    console.log("Something went wrong 😢");
  } else {
    form.reset();
    fetchData();
  }
}
