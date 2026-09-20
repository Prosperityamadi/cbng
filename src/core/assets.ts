import BankLogoImg from '@/assets/icons/NemiCapital-International-Bank-logo.png';
import Hero1Img from '@/assets/images/hero-1.jpg';
import Hero2Img from '@/assets/images/hero-2.jpg';
import Hero3Img from '@/assets/images/hero-3.jpg';
import Hero4Img from '@/assets/images/hero-4.jpg';
import Hero5Img from '@/assets/images/hero-5.jpg';
import BinocularsImg from '@/assets/icons/binoculars.png';
import MicrophoneImg from '@/assets/icons/microphone.png';
import CoinImg from '@/assets/icons/coin.png';
import MobileBankingImg from '@/assets/icons/mobile-banking.png';
import DebtImg from '@/assets/icons/debt.png';
import ChatImg from '@/assets/icons/chat.png';
import CreditCardImg from '@/assets/icons/credit-card.png';
import AccountDetailsImg from '@/assets/icons/account-details.png';
import ChequeBookImg from '@/assets/icons/cheque-book.png';
import BuyHomeImg from '@/assets/icons/buy-home.png';
import OnlineShoppingImg from '@/assets/icons/online-shopping.png';
import WatchingAMovieImg from '@/assets/icons/watching-a-movie.png';
import CostumerImg from '@/assets/icons/costumer.png';
import CalendarImg from '@/assets/icons/calendar.png';
import BranchImg from '@/assets/icons/branch.png';
import GoalImg from '@/assets/icons/goal.png';
import CarLoanImg from '@/assets/icons/car-loan.png';
import CustomerRepImg from '@/assets/images/customer-rep-image.jpg';
import CreditCard1Img from '@/assets/images/credit-card-1.jpg';
import BankingNeedsBg from '@/assets/images/banking-needs-bg.jpg';
import ForexBgImg from '@/assets/images/forex-bg.jpg';
import QuestionImg from '@/assets/images/question.jpg';
import HouseLoanImg from '@/assets/images/house-loan.jpg';
import MoneyProtectionImg from '@/assets/images/money-protection.jpg';
import MobileAppBgImg from '@/assets/images/mobile-app-bg.jpg';
import PlaystoreImg from '@/assets/icons/playstore.png';
import AppstoreImg from '@/assets/icons/appstore.png';

/**
 * Core Assets Reference
 * Maps all brand visual assets, hero slides, and icons for easy imports.
 */
export const ASSETS = {
  logos: {
    main: BankLogoImg,
    altText: 'NemiCapital International Bank Logo',
  },
  heroSlides: {
    slide1: Hero1Img,
    slide2: Hero2Img,
    slide3: Hero3Img,
    slide4: Hero4Img,
    slide5: Hero5Img,
  },
  backgrounds: {
    bankingNeeds: BankingNeedsBg,
    forex: ForexBgImg,
  },
  images: {
    customerRep: CustomerRepImg,
    creditCard1: CreditCard1Img,
    question: QuestionImg,
    houseLoan: HouseLoanImg,
    moneyProtection: MoneyProtectionImg,
    mobileAppBg: MobileAppBgImg,
  },
  icons: {
    binoculars: BinocularsImg,
    microphone: MicrophoneImg,
    coin: CoinImg,
    mobileBanking: MobileBankingImg,
    debt: DebtImg,
    chat: ChatImg,
    creditCard: CreditCardImg,
    accountDetails: AccountDetailsImg,
    chequeBook: ChequeBookImg,
    buyHome: BuyHomeImg,
    onlineShopping: OnlineShoppingImg,
    watchingAMovie: WatchingAMovieImg,
    costumer: CostumerImg,
    calendar: CalendarImg,
    branch: BranchImg,
    goal: GoalImg,
    carLoan: CarLoanImg,
    playstore: PlaystoreImg,
    appstore: AppstoreImg,
    check: '/icons/custom-check.svg',
  }
} as const;
