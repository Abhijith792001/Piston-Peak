import React from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import ProductPageClient from './ProductPageClient';

export async function generateStaticParams() {
  return [
    { id: "BzdCYIHiaAdKPU1O50ky" },
    { id: "R3Aqm74iGAIyVvW6HeZq" },
    { id: "UV44R8HJCv9Grlu9uGsF" },
    { id: "rAixrbqOT701gWy8Igu4" },
    { id: "suYxq0nkYW0AdXbBiKgS" }
  ];
}

export default function Page() {
  return <ProductPageClient />;
}
