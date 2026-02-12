import { z } from 'zod';

// סכימה ליצירת מוצר חדש (POST)
export const createProductSchema = z.object({
  body: z.object({
    id: z.number({ message: "ID must be a number" }).positive("ID must be positive"),
    name: z.string({ message: "Name is required" }).min(2, "Name must be at least 2 characters long"),
    price: z.number({ message: "Price must be a number" }).nonnegative("Price cannot be negative")
  })
});

// סכימה לעדכון מוצר (PUT)
export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID in URL must be a numeric string")
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    price: z.number().nonnegative().optional()
  })
});

// סכימה למחיקה (DELETE)
export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID in URL must be a numeric string")
  })
});

// סכימה להרשמה (Registration)
export const registerSchema = z.object({
  body: z.object({
    username: z.string({ message: "Username is required" })
      .min(3, "Username must be at least 3 characters long")
      .max(15, "Username cannot exceed 20 characters"),
      
    password: z.string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters long")
      .max(15, "Password cannot exceed 30 characters")
      // בדיקה שקיימת לפחות אות אחת גדולה (A-Z)
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      // בדיקה שהסיסמה מכילה רק תווים באנגלית, מספרים או סימנים (ללא עברית)
      .regex(/^[a-zA-Z0-9!@#$%^&*]+$/, { message: "Password must be in English only" })
  })
});