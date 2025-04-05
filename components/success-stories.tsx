import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Quote } from "lucide-react"

export default function SuccessStories() {
  const stories = [
    {
      id: 1,
      petName: "Buddy",
      ownerName: "Sarah & Michael",
      quote: "Adopting Buddy was the best decision we ever made. He's brought so much joy and laughter into our home.",
      image: "/placeholder.svg?height=300&width=300",
      petImage: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 2,
      petName: "Mittens",
      ownerName: "David",
      quote:
        "Mittens has been my companion through thick and thin. I can't imagine life without her purrs and cuddles.",
      image: "/placeholder.svg?height=300&width=300",
      petImage: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 3,
      petName: "Rocky",
      ownerName: "The Johnson Family",
      quote: "Rocky has become such an important part of our family. The kids adore him and he's so patient with them.",
      image: "/placeholder.svg?height=300&width=300",
      petImage: "/placeholder.svg?height=150&width=150",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-white to-purple-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Happy Tails: Success Stories</h2>
          <p className="text-muted-foreground max-w-[700px]">
            Read heartwarming stories from families who found their perfect companions through our adoption program.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden border-none shadow-md">
              <CardContent className="p-0">
                <div className="relative h-48 w-full bg-purple-100">
                  <Image
                    src={story.image || "/placeholder.svg"}
                    alt={`${story.ownerName} with ${story.petName}`}
                    fill
                    className="object-cover opacity-20"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <Quote className="h-10 w-10 text-purple-600 mb-4" />
                    <p className="text-sm md:text-base font-medium">"{story.quote}"</p>
                  </div>
                </div>
                <div className="flex items-center p-6">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-white shadow-sm">
                    <Image
                      src={story.petImage || "/placeholder.svg"}
                      alt={story.petName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">{story.ownerName}</h3>
                    <p className="text-sm text-muted-foreground">with {story.petName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
            Read More Success Stories
          </Button>
        </div>
      </div>
    </section>
  )
} 