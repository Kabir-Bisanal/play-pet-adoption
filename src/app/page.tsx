import HomeClient from "@/components/HomeClient";
import { getPets, getSuccessStories } from "@/lib/pets";

export default async function HomePage() {
  const [pets, stories] = await Promise.all([getPets(), getSuccessStories()]);
  return <HomeClient initialPets={pets} initialStories={stories} />;
}
