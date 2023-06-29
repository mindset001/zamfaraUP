import { card } from "../assets";
import styles, { layout } from "../style";
import GetStarted from "./GetStarted";

const CardDeal = () => (
  <section className={layout.section}>
    {/* <div className={layout.sectionInfo}>
    <a href="https://zamfara-mlcd.greenerp.ng/zamfara-state-tech-idea-form?new=1">
        <GetStarted />
        </a>

   
    </div> */}

<div className=" flex-row align justify-center">
          <a href="https://zamfara-mlcd.greenerp.ng/zamfara-state-tech-idea-form?new=1">
        <GetStarted />
        </a>
          </div>
  </section>
);

export default CardDeal;
