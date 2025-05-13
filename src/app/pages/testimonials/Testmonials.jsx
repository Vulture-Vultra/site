"use client"
import Image from "next/image"


const testimonials = [
  {
    id: 1,
    name: "Alison Jordan",
    role: "Marketing Director",
    content:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    rating: 5,
    image: "/testi3.png?height=100&width=100",
  },
  {
    id: 2,
    name: "John Smith",
    role: "CEO & Founder",
    content:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    rating: 5,
    image: "/testi3.png?height=100&width=100",
  },
  {
    id: 3,
    name: "Emily Davis",
    role: "Product Manager",
    content:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    rating: 4,
    image: "/testi3.png?height=100&width=100",
  },
  {
    id: 4,
    name: "Michael Chen",
    role: "Lead Developer",
    content:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    rating: 5,
    image: "/testi3.png?height=100&width=100",
  },
  {
    id: 5,
    name: "Sarah Johnson",
    role: "Customer Success",
    content:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    rating: 5,
    image: "/testi3.png?height=100&width=100",
  },
  {
    id: 6,
    name: "David Wilson",
    role: "UX Designer",
    content:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    rating: 4,
    image: "/testi3.png?height=100&width=100",
  },
]

const TestimonialCard = ({ testimonial, direction }) => (
  <div
    className={`flex-none w-[350px] mx-4 bg-white/10 rounded-xl py-6 shadow-lg ${direction === "right" ? "animate-scroll-right" : "animate-scroll-left"}`}
  >
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 relative w-24 h-24 overflow-hidden rounded-full border-2 border-indigo-500">
        <Image src={testimonial.image || "/placeholder.svg"} alt={testimonial.name}fill className="object-cover  " />
      </div>
      <h3 className="text-xl font-bold">{testimonial.name}</h3>
      <p className="text-gray-400 mb-4">{testimonial.role}</p>
      <p className="text-gray-300 mb-4 p-4">{testimonial.content}</p>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < testimonial.rating ? "text-yellow-400" : "text-gray-600"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  </div>
)

export default function Testimonials() {
  return (
    <>
      <style jsx global>{`
        @keyframes scrollRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes scrollLeft {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        
        .animate-scroll-right {
          animation: scrollRight 10s linear infinite;
        }
        
        .animate-scroll-left {
          animation: scrollLeft 10s linear infinite;
        }
        
        .pause-on-hover:hover .animate-scroll-right,
        .pause-on-hover:hover .animate-scroll-left {
          animation-play-state: paused;
        }
      `}</style>

      <section className="py-16  text-white overflow-hidden">
        <div className="container mx-auto px-4 mb-10">
          <h2 className="text-4xl font-bold text-center mb-2">What Our Clients Say</h2>
          <p className="text-xl text-center text-gray-400 mb-12">Trusted by thousands of satisfied customers</p>
        </div>

        
        <div className="relative overflow-hidden mb-8 pause-on-hover">
          <div className="flex">
            {testimonials.concat(testimonials).map((testimonial, index) => (
              <TestimonialCard key={`top-${testimonial.id}-${index}`} testimonial={testimonial} direction="right" />
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden pause-on-hover">
          <div className="flex">
            {testimonials.concat(testimonials).map((testimonial, index) => (
              <TestimonialCard key={`bottom-${testimonial.id}-${index}`} testimonial={testimonial} direction="left" />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

