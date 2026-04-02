import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import "./index.css";

export function App() {
  return (
    <div className="container mx-auto p-8 text-center relative z-10">
      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="text-3xl font-bold">Three Checkers</CardTitle>
          <CardDescription>
            A stunning 3D checkers game built with React, Three.js. Challenge
            yourself against an AI opponent with dynamic lighting, smooth
            animations, and real-time AI rival
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-w-48" />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
