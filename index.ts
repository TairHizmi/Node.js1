import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { createProductSchema, updateProductSchema, deleteProductSchema, registerSchema } from './validation';

const app = express();
const port = 3000;

// הגדרות Middleware לקריאת נתונים מגוף הבקשה (Body)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// הגדרת תיקיית Static עבור קבצי HTML, CSS, JS
app.use(express.static('public'));

// Middleware לתיעוד זמן וכתובת הבקשה
const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const now = new Date();
  const timeString = now.toLocaleString('he-IL');
  const path = req.path;
  console.log(`⏰ זמן הבקשה: ${timeString} | 🛤️  נתיב: ${path}`);
  next();
};

// פונקציית Middleware לביצוע וולידציה באמצעות Zod
// הפונקציה בודקת את ה-body ואת ה-params לפני שהבקשה מגיעה לראוט
const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (e: any) {
    // חילוץ רשימת השגיאות מתוך Zod
    const issues = e.issues || [];
    
    if (issues.length > 0) {
      // אנחנו עוברים על כל השגיאות, לוקחים את ה-message של כל אחת,
      // ומחברים אותן למחרוזת אחת עם פסיק ורווח ביניהן
      const allErrors = issues.map((err: any) => err.message).join(", ");
      
      return res.status(400).send(allErrors);
    }

    return res.status(400).send(e.message || "Validation error");
  }
};
// בסיס הנתונים הזמני שלנו (In-memory)
let pruducts = [
  { id: 1, name: 'Product 1', price: 10 },
  { id: 2, name: 'Product 2', price: 20 },
  { id: 3, name: 'Product 3', price: 30 },
  { id: 4, name: 'Product 4', price: 40 },
  { id: 5, name: 'Product 5', price: 50 },
  { id: 6, name: 'Product 6', price: 60 },
  { id: 7, name: 'Product 7', price: 70 },
  { id: 8, name: 'Product 8', price: 80 },
  { id: 9, name: 'Product 9', price: 90 },
  { id: 10, name: 'Product 10', price: 100 },
];

// 0. POST - הרשמה לאתר
app.post('/register', loggingMiddleware, validate(registerSchema), (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log(`✅ הרשמה חדשה: username=${username}`);
  res.status(201).send(`ברוכים הבאים ל${username}!`);
});

// 1. GET - קבלת כל המוצרים
app.get('/pruducts', (req: Request, res: Response) => {
  res.json(pruducts);
});

// 2. POST - יצירת מוצר חדש (כולל וולידציה של Zod)
app.post('/pruducts', validate(createProductSchema), (req: Request, res: Response) => {
  const newPruduct = req.body;
  console.log("Adding new product:", newPruduct);
  
  pruducts.push(newPruduct);
  res.status(201).send('Product created successfully');
});

// 3. DELETE - מחיקת מוצר לפי ID
app.delete('/pruducts/:id', validate(deleteProductSchema), (req: Request, res: Response) => {
  const pruductId = Number(req.params.id);
  const indexToDelete = pruducts.findIndex(pruduct => pruduct.id === pruductId);

  // בדיקה אם המוצר קיים לפני המחיקה
  if (indexToDelete === -1) {
    return res.status(404).send('Product not found');
  }

  pruducts.splice(indexToDelete, 1);
  res.send(`Product ID: ${pruductId} deleted successfully`);
});

// 4. PUT - עדכון מוצר קיים
app.put('/pruducts/:id', validate(updateProductSchema), (req: Request, res: Response) => {
  const pruductId = Number(req.params.id);
  const pruductIndex = pruducts.findIndex(pruduct => pruduct.id === pruductId);

  // בדיקה אם המוצר קיים לפני העדכון
  if (pruductIndex === -1) {
    return res.status(404).send('Product not found');
  }

  const updatedPruductData = req.body;
  
  // מניעת שינוי ה-ID של המוצר דרך ה-body
  delete updatedPruductData.id;

  console.log("Updating product ID:", pruductId, "with data:", updatedPruductData);
  
  // עדכון המוצר על ידי מיזוג הנתונים הקיימים עם הנתונים החדשים
  pruducts[pruductIndex] = { ...pruducts[pruductIndex], ...updatedPruductData };
  
  res.send('Product updated successfully');
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});