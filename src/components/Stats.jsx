import { apply } from "../constants";
import styles from "../style";

const Stats = () => (
  <section >
    <div className="flex-row text-center py-10">
      <h1 className="font-poppins font-semibold xs:text-[40.89px] text-[30.89px] xs:leading-[53.16px] leading-[43.16px] text-white">
        Steps To Apply
      </h1>
    </div>
   <div className={`${styles.flexCenter} flex-row flex-wrap sm:mb-20 mb-6`}>
   {apply.map((step) => (
      <div key={step.id} className={`flex-1 flex justify-start items-center flex-row m-3`} >
        <div>
        <div>
        <h4 className="font-poppins font-semibold xs:text-[40.89px] text-[30.89px] xs:leading-[53.16px] leading-[43.16px] text-white">
          {step.id}
        </h4>
        </div>
        <p className="font-poppins font-normal xs:text-[20.45px] text-[15.45px] xs:leading-[26.58px] leading-[21.58px] text-gradient uppercase ml-3">
          {step.title}
        </p>
        <p className="font-poppins font-normal xs:text-[15.45px] text-[15.45px] xs:leading-[26.58px] leading-[21.58px] text-white uppercase ml-3">
          {step.msg}
        </p>
        </div>
      </div>
    ))}
   </div>
  </section>
);

export default Stats;
