import { apple, bill, google, require, captain } from "../assets";
import styles, { layout } from "../style";

const Billing = () => (
  <section id="product" className={layout.sectionReverse}>
    <div className={layout.sectionImgReverse}>
      <img src={captain} alt="billing" className="w-[100%] h-[100%] relative z-[5]" />

      {/* gradient start */}
      <div className="absolute z-[3] -left-1/2 top-0 w-[50%] h-[50%] rounded-full white__gradient" />
      <div className="absolute z-[0] w-[50%] h-[50%] -left-1/2 bottom-0 rounded-full pink__gradient" />
      {/* gradient end */}
    </div>

    <div className={layout.sectionInfo}>
      <h2 className={styles.heading2}>
        Eligibility Status <br className="sm:block hidden" /> & Requirements
      </h2>
      <ul className="list-disc text-justify">
        <li className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Must be a citizen of the state
      
        </li>
        <li className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Must be unemployed
    
        </li>
        <li className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Must have at least school leaving certifaicate
     
        </li>
        <li className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Must have a means of identification
    
        </li>
        <li className={`${styles.paragraph} max-w-[470px] mt-5`}>
       Must have a Bank Verification Number
    
        </li>
        <li className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Must have a recent Passport Photograph
      
        </li>
      </ul>

        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          Note: Applying is not a guarantee for employment.
        </p>
     
    </div>
  </section>
);

export default Billing;
