import * as z from "zod"

export const propertyStatusValues = ["available", "reserved", "sold", "rented"] as const
export const propertyTypeValues = ["apartment", "villa", "independent_house", "plot", "commercial", "farmhouse", "penthouse"] as const
export const furnishingValues = ["unfurnished", "semi_furnished", "fully_furnished"] as const

export const PropertyFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  property_type: z.enum(propertyTypeValues),
  status: z.enum(propertyStatusValues),
  price: z.number().min(1, "Price is required"),
  price_negotiable: z.boolean().optional(),
  locality: z.string().min(1, "Locality is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().optional(),
  address: z.string().optional(),
  bhk: z.number().min(0).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  area_sqft: z.number().min(1, "Area is required"),
  area_unit: z.enum(["sqft", "sqyard", "sqm"]),
  road_info: z.string().optional(),
  furnishing: z.enum(furnishingValues),
  floor_number: z.string().optional(),
  total_floors: z.string().optional(),
  facing: z.string().optional(),
  parking: z.string().optional(),
  maintenance_charge: z.number().min(0).optional(),
  cover_image_url: z.string().optional(),
  image_urls: z.array(z.string()).optional(),
})

export type PropertyFormValues = z.infer<typeof PropertyFormSchema>

export type PropertyFilters = {
  search?: string
  property_type?: string
  status?: string
  bedrooms?: number
  price_min?: number
  price_max?: number
}
