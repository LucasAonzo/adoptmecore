"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { PawPrint, Search, Cake, Users, Heart, Info } from "lucide-react"
import { speciesOptions, genderOptions } from "@/lib/schemas/petSchema"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define age categories with Spanish translations
const ageCategories = {
  puppy: { label: "Cachorro (0-1 año)", description: "Juguetones y llenos de energía" },
  young: { label: "Joven (1-3 años)", description: "Activos y adaptables" },
  adult: { label: "Adulto (3-7 años)", description: "Equilibrados y entrenados" },
  senior: { label: "Senior (7+ años)", description: "Tranquilos y cariñosos" },
}

// Spanish translations for species
const speciesTranslations: Record<string, string> = {
  dog: "Perro",
  cat: "Gato",
  rabbit: "Conejo",
  bird: "Ave",
  hamster: "Hámster",
  // Add other translations as needed
}

// Define fixed styles for PawPrints for better distribution
const fixedPawPrintStyles = [
  { top: '10%', left: '5%', transform: 'rotate(-15deg)' }, { top: '25%', left: '20%', transform: 'rotate(30deg)' },
  { top: '5%', left: '35%', transform: 'rotate(10deg)' },  { top: '40%', left: '45%', transform: 'rotate(-25deg)' },
  { top: '15%', left: '60%', transform: 'rotate(45deg)' },  { top: '30%', left: '75%', transform: 'rotate(-10deg)' },
  { top: '5%', left: '90%', transform: 'rotate(20deg)' },   { top: '50%', left: '10%', transform: 'rotate(-35deg)' },
  { top: '65%', left: '30%', transform: 'rotate(5deg)' },   { top: '55%', left: '55%', transform: 'rotate(50deg)' },
  { top: '70%', left: '70%', transform: 'rotate(-5deg)' },  { top: '60%', left: '95%', transform: 'rotate(15deg)' },
  { top: '85%', left: '5%', transform: 'rotate(40deg)' },   { top: '90%', left: '25%', transform: 'rotate(-20deg)' },
  { top: '80%', left: '40%', transform: 'rotate(60deg)' },  { top: '95%', left: '50%', transform: 'rotate(0deg)' },
  { top: '75%', left: '65%', transform: 'rotate(-45deg)' }, { top: '90%', left: '80%', transform: 'rotate(25deg)' },
  { top: '85%', left: '95%', transform: 'rotate(-30deg)' },{ top: '35%', left: '5%', transform: 'rotate(70deg)' },
  { top: '50%', left: '40%', transform: 'rotate(-60deg)' },{ top: '20%', left: '50%', transform: 'rotate(80deg)' },
  { top: '45%', left: '85%', transform: 'rotate(-50deg)' },{ top: '70%', left: '15%', transform: 'rotate(90deg)' },
  { top: '10%', left: '70%', transform: 'rotate(-75deg)' }
];

export function PetSearchFilters() {
  const router = useRouter()

  // State for filters
  const [petType, setPetType] = useState<string>("all")
  const [breed, setBreed] = useState<string>("all")
  const [gender, setGender] = useState<string>("all")
  const [age, setAge] = useState<string>("all")

  const handleSearch = () => {
    const queryParams = new URLSearchParams()
    if (petType && petType !== "all") queryParams.set("species", petType)
    if (breed && breed !== "all") queryParams.set("breed", breed)
    if (gender && gender !== "all") queryParams.set("gender", gender)
    if (age && age !== "all") queryParams.set("ageCategory", age)
    router.push(`/adopt?${queryParams.toString()}`)
  }

  // Get breed options based on selected pet type
  const getBreedOptions = () => {
    if (petType === "dog" || petType === "all") {
      return [
        { value: "labrador", label: "Labrador" },
        { value: "golden-retriever", label: "Golden Retriever" },
        { value: "german-shepherd", label: "Pastor Alemán" },
        { value: "beagle", label: "Beagle" },
        { value: "mixed", label: "Mestizo" },
      ]
    } else if (petType === "cat") {
      return [
        { value: "siamese", label: "Siamés" },
        { value: "persian", label: "Persa" },
        { value: "bengal", label: "Bengalí" },
        { value: "maine-coon", label: "Maine Coon" },
        { value: "mixed", label: "Mestizo" },
      ]
    }
    return [{ value: "mixed", label: "Mestizo" }]
  }

  return (
    <section className="relative w-full bg-gradient-to-b from-primary-50 to-background">
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0px]">
        <svg 
          data-name="Layer 1" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[75px] fill-muted"
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31.74,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
          ></path>
        </svg>
      </div>

      <div className="container px-4 md:px-6 pt-24 pb-12 md:pt-28 md:pb-16">
        <div className="mx-auto max-w-[1100px]">
          
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="relative h-24 bg-primary/10 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                {fixedPawPrintStyles.map((style, i) => (
                  <PawPrint
                    key={i}
                    className="h-8 w-8 text-primary absolute"
                    style={style}
                  />
                ))}
              </div>
              
            </div>

            <CardContent className="pt-12 pb-8 px-6 md:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
                {/* Pet Type (Species) Filter */}
                <div className="space-y-2">
                  <label htmlFor="pet-type-filter" className="text-sm font-medium flex items-center gap-1.5">
                    <PawPrint className="h-4 w-4 text-primary" />
                    Tipo de Mascota
                  </label>
                  <Select
                    value={petType}
                    onValueChange={(value) => {
                      setPetType(value)
                      setBreed("all") // Reset breed when species changes
                    }}
                  >
                    <SelectTrigger id="pet-type-filter" className="w-full bg-white border-muted">
                      <SelectValue placeholder="Cualquiera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cualquiera</SelectItem>
                      {speciesOptions.map((species) => (
                        <SelectItem key={species} value={species} className="capitalize">
                          {speciesTranslations[species] || species}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Breed Filter */}
                <div className="space-y-2">
                  <label htmlFor="breed-filter" className="text-sm font-medium flex items-center gap-1.5">
                    <PawPrint className="h-4 w-4 text-primary" />
                    Raza
                  </label>
                  <Select value={breed} onValueChange={setBreed}>
                    <SelectTrigger id="breed-filter" className="w-full bg-white border-muted">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {getBreedOptions().map((breedOption) => (
                        <SelectItem key={breedOption.value} value={breedOption.value}>
                          {breedOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Filter */}
                <div className="space-y-2">
                  <label htmlFor="gender-filter" className="text-sm font-medium flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" />
                    Género
                  </label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender-filter" className="w-full bg-white border-muted">
                      <SelectValue placeholder="Cualquiera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cualquiera</SelectItem>
                      {genderOptions.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g === "male" ? "Macho" : g === "female" ? "Hembra" : "Desconocido"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Filter */}
                <div className="space-y-2">
                  <label htmlFor="age-filter" className="text-sm font-medium flex items-center gap-1.5">
                    <Cake className="h-4 w-4 text-primary" />
                    Edad
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            La edad de una mascota puede influir en su energía, entrenamiento y necesidades especiales
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <Select value={age} onValueChange={setAge}>
                    <SelectTrigger id="age-filter" className="w-full bg-white border-muted">
                      <SelectValue placeholder="Cualquiera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cualquiera</SelectItem>
                      {Object.entries(ageCategories).map(([key, { label, description }]) => (
                        <SelectItem key={key} value={key} className="flex flex-col items-start">
                          <span>{label}</span>
                          <span className="text-xs text-muted-foreground">{description}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <div className="space-y-2">
                  <Button onClick={handleSearch} className="w-full h-10 font-medium" size="lg">
                    <Search className="mr-2 h-4 w-4" />
                    Encontrar Mascotas
                  </Button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-dashed border-muted flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <PawPrint className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">¿No estás seguro?</span> Explora todas nuestras
                    mascotas disponibles
                  </p>
                </div>
                <Button 
                  className="h-10 bg-amber-200 text-amber-800 hover:bg-amber-300" 
                  onClick={() => router.push("/adopt")}
                >
                  Ver Todas las Mascotas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
} 