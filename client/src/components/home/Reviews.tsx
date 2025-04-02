import { useState } from "react";
import { useReviews } from "@/hooks/useReviews";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageSquare, Truck, Award } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
  images?: string[];
  user?: {
    firstName: string;
    lastName: string;
  };
}

const Reviews = () => {
  const { data: reviewsData, isLoading, error } = useReviews();
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const reviews = reviewsData as Review[] || [];
  
  const handlePrevReview = () => {
    if (reviews.length === 0) return;
    setCurrentReviewIndex((prevIndex) => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };
  
  const handleNextReview = () => {
    if (reviews.length === 0) return;
    setCurrentReviewIndex((prevIndex) => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Calculate mock data for the review stats display
  const getReviewUsername = (review?: Review) => {
    if (!review) return "Happy Customer";
    
    if (review.user) {
      return `${review.user.firstName} & ${review.user.firstName}'s Dog`;
    }
    
    return `Customer #${review.userId}`;
  };
  
  const renderReviewCarousel = () => {
    if (isLoading) {
      return (
        <Card className="min-w-full px-4">
          <CardContent className="p-6 md:p-8">
            <div className="animate-pulse">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded mb-1 w-full"></div>
              <div className="h-4 bg-gray-200 rounded mb-1 w-full"></div>
              <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (error) {
      return (
        <Card className="min-w-full px-4">
          <CardContent className="p-6 md:p-8 text-center">
            <MessageSquare className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h4 className="font-bold text-xl mb-2">Unable to load reviews</h4>
            <p className="text-gray-500">Please try again later.</p>
          </CardContent>
        </Card>
      );
    }
    
    if (!reviews || reviews.length === 0) {
      return (
        <Card className="min-w-full px-4">
          <CardContent className="p-6 md:p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-bold text-xl mb-2">No reviews yet</h4>
            <p className="text-gray-500">Be the first to review our products!</p>
          </CardContent>
        </Card>
      );
    }
    
    const review = reviews[currentReviewIndex];
    
    return (
      <Card className="min-w-full px-4">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start mb-6">
            <img 
              src="https://images.unsplash.com/photo-1517423568366-8b83523034fd" 
              alt="Happy customer with their dog" 
              className="w-16 h-16 rounded-full object-cover mr-4" 
            />
            <div>
              <h4 className="font-bold">{getReviewUsername(review)}</h4>
              <div className="text-primary flex mb-1">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i} 
                    className={i < review.rating ? "fas fa-star" : "far fa-star"}
                  ></i>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Verified Customer • {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="italic mb-6">{review.comment}</p>
          {review.images && review.images.length > 0 && (
            <div className="flex overflow-x-auto gap-4 pb-2">
              {review.images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt="Customer review" 
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <section id="reviews" className="py-16 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Happy Dogs & Happy Owners</h2>
          <p className="max-w-2xl mx-auto text-lg">Don't just take our word for it. See what our customers and their furry friends have to say.</p>
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          {/* Review Carousel */}
          <div className="flex overflow-x-hidden">
            {renderReviewCarousel()}
          </div>
          
          {/* Carousel Navigation */}
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute top-1/2 -translate-y-1/2 left-0 -ml-4 w-10 h-10 bg-white rounded-full shadow-lg text-primary flex items-center justify-center"
            onClick={handlePrevReview}
            disabled={reviews.length === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute top-1/2 -translate-y-1/2 right-0 -mr-4 w-10 h-10 bg-white rounded-full shadow-lg text-primary flex items-center justify-center"
            onClick={handleNextReview}
            disabled={reviews.length === 0}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Review Stats */}
        <div className="mt-12 max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-2/5 bg-primary text-white p-8">
              <div className="text-center">
                <div className="text-6xl font-bold">4.9</div>
                <div className="text-white flex justify-center my-2">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="mb-4">Based on 340 reviews</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm">
                    <span className="w-20 text-left">5 Stars</span>
                    <div className="h-2 bg-white/20 rounded-full flex-grow mx-2">
                      <div className="h-2 bg-white rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <span>92%</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-20 text-left">4 Stars</span>
                    <div className="h-2 bg-white/20 rounded-full flex-grow mx-2">
                      <div className="h-2 bg-white rounded-full" style={{width: '6%'}}></div>
                    </div>
                    <span>6%</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-20 text-left">3 Stars</span>
                    <div className="h-2 bg-white/20 rounded-full flex-grow mx-2">
                      <div className="h-2 bg-white rounded-full" style={{width: '2%'}}></div>
                    </div>
                    <span>2%</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-20 text-left">2 Stars</span>
                    <div className="h-2 bg-white/20 rounded-full flex-grow mx-2">
                      <div className="h-2 bg-white rounded-full" style={{width: '0%'}}></div>
                    </div>
                    <span>0%</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-20 text-left">1 Star</span>
                    <div className="h-2 bg-white/20 rounded-full flex-grow mx-2">
                      <div className="h-2 bg-white rounded-full" style={{width: '0%'}}></div>
                    </div>
                    <span>0%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-3/5 p-8">
              <h3 className="text-2xl font-bold mb-4">What Customers Love</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="bg-primary/10 text-primary p-2 rounded-full mr-3">
                    <i className="fas fa-utensils"></i>
                  </span>
                  <div>
                    <h4 className="font-semibold">Food Quality</h4>
                    <p className="text-sm">Customers rave about the freshness and quality of ingredients.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-primary/10 text-primary p-2 rounded-full mr-3">
                    <i className="fas fa-heart"></i>
                  </span>
                  <div>
                    <h4 className="font-semibold">Health Improvements</h4>
                    <p className="text-sm">Many report improved energy, coat condition, and digestion.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-primary/10 text-primary p-2 rounded-full mr-3">
                    <i className="fas fa-shipping-fast"></i>
                  </span>
                  <div>
                    <h4 className="font-semibold">Reliable Delivery</h4>
                    <p className="text-sm">Consistent, on-time delivery keeps pets and parents happy.</p>
                  </div>
                </div>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="inline-block mt-6 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-full px-6 py-2"
                  >
                    Read All Reviews
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>Customer Reviews</DialogTitle>
                    <DialogDescription>
                      What our customers and their furry friends have to say
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto">
                    {reviews.map(review => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start">
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold">{getReviewUsername(review)}</h4>
                                  <div className="text-primary flex mb-1">
                                    {[...Array(5)].map((_, i) => (
                                      <i 
                                        key={i} 
                                        className={i < review.rating ? "fas fa-star" : "far fa-star"}
                                      ></i>
                                    ))}
                                  </div>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-2">{review.comment}</p>
                              {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                  {review.images.map((image, index) => (
                                    <img 
                                      key={index}
                                      src={image} 
                                      alt="Review" 
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
