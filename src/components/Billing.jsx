import { apple, bill, google, require } from "../assets";
import styles, { layout } from "../style";

const Billing = () => (
  <section id="product" className={layout.sectionReverse}>
    <div className={layout.sectionImgReverse}>
      <img src={require} alt="billing" className="w-[100%] h-[100%] relative z-[5]" />

      {/* gradient start */}
      <div className="absolute z-[3] -left-1/2 top-0 w-[50%] h-[50%] rounded-full white__gradient" />
      <div className="absolute z-[0] w-[50%] h-[50%] -left-1/2 bottom-0 rounded-full pink__gradient" />
      {/* gradient end */}
    </div>

    <div className={layout.sectionInfo}>
      <h2 className={styles.heading2}>
        Eligibility Status <br className="sm:block hidden" /> & Requirements
      </h2>
      <ul>
        <li>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Must be a citizen of the state
      </p>
        </li>
        <li>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Must be unemployed
      </p>
        </li>
        <li>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Must have at least school leaving certifaicate
      </p>
        </li>
        <li>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Must have a means of identification
      </p>
        </li>
        <li>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
       Must have a Bank Verification Number
      </p>
        </li>
        <li>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Must have a recent Passport Photograph
      </p>
        </li>
      </ul>

     
    </div>
  </section>
);

export default Billing;
