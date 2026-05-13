import { Suspense } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import ServicesSection from '@/components/landing/ServicesSection';
import ServicesSectionSkeleton from '@/components/landing/ServicesSectionSkeleton';
import BenefitsSection from '@/components/landing/BenefitsSection';
import CtaSection from '@/components/landing/CtaSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<ServicesSectionSkeleton />}>
        <ServicesSection />
      </Suspense>
      <BenefitsSection />
      <CtaSection />
    </>
  );
}
