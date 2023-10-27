'use client'
import Link from 'next/link';
import Image from "next/image";
import {Suspense} from "react";
import Loading from "@/app/loading";

export default function Home() {

  return (
      <Suspense fallback={<Loading/>}>
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
          <div className="text-center mb-4">
            <Image
              src="/TyevoMockupLogo.png"
              alt="Tyevo Mock Up Logo"
              width={500}
              height={500}
              layout="responsive"
            />
          </div>
          <div className="text-center">
            <h1 className="text-4xl mb-4">Payments Test</h1>
            <p className="mb-8">A mockup application to test Stripe payments</p>
          </div>
          <div className="flex space-x-4">
            <Link href="wallet">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Wallet</button>
            </Link>
            <Link href="ride">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Take Ride</button>
            </Link>
          </div>
        </div>
        </Suspense>
  );
}
