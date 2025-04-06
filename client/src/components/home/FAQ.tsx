import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

// Define the FAQ interface
interface FAQ {
  id: number;
  question: string;
  answer: string;
}

// Create a custom hook for FAQs
const useFAQs = () => {
  return useQuery<FAQ[], Error>({
    queryKey: ['/api/faqs'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

const FAQ = () => {
  const { data: faqs, isLoading, error } = useFAQs();

  const renderFAQs = () => {
    if (isLoading) {
      return Array(5).fill(0).map((_, index) => (
        <div key={index} className="mb-4">
          <Skeleton className="w-full h-14 rounded-xl mb-2" />
          <Skeleton className="w-full h-24 rounded-b-xl hidden" />
        </div>
      ));
    }

    if (error || !faqs || faqs.length === 0) {
      return (
        <div className="text-center p-8 bg-light rounded-xl">
          <p className="text-gray-500">
            {error ? "Error loading FAQs. Please try again later." : "No FAQs available at the moment."}
          </p>
        </div>
      );
    }

    return (
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq: FAQ) => (
          <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="mb-4 border-0">
            <AccordionTrigger className="bg-light rounded-xl p-5 font-heading font-semibold hover:bg-light/80 transition">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="bg-white px-5 pb-5 rounded-b-xl">
              <div className="pt-3">{faq.answer}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <section id="faq" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="max-w-2xl mx-auto text-lg">Got questions? We've got answers to help you make the best choice for your furry friend.</p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {renderFAQs()}
          
          <div className="text-center mt-8">
            <p className="mb-4">Still have questions? We're here to help!</p>
            <Button 
              onClick={() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-8 py-3"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
