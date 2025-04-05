import { Button } from "@/components/ui/button"
import { Search, Heart, FileText, Home } from "lucide-react"

export default function AdoptionProcess() {
  const steps = [
    {
      icon: <Search className="h-10 w-10 text-purple-600" />,
      title: "Browse Available Pets",
      description:
        "Search through our database of pets looking for their forever homes. Filter by species, breed, age, and more.",
    },
    {
      icon: <Heart className="h-10 w-10 text-purple-600" />,
      title: "Meet Your Match",
      description:
        "Schedule a visit to meet the pet you're interested in. Spend time getting to know them and see if you're a good fit.",
    },
    {
      icon: <FileText className="h-10 w-10 text-purple-600" />,
      title: "Complete Application",
      description:
        "Fill out our adoption application. We'll review your information to ensure the pet is going to a suitable home.",
    },
    {
      icon: <Home className="h-10 w-10 text-purple-600" />,
      title: "Welcome Home",
      description:
        "Once approved, complete the adoption process, pay the adoption fee, and welcome your new family member home!",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">How the Adoption Process Works</h2>
          <p className="text-muted-foreground max-w-[700px]">
            We've made adopting a pet simple and straightforward. Here's what you can expect when you decide to bring a
            new friend into your home.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button className="bg-purple-600 hover:bg-purple-700">Start Your Adoption Journey</Button>
        </div>
      </div>
    </section>
  )
} 