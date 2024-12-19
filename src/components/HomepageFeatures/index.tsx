import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Secure Collaboration',
    Svg: require('@site/static/img/smpc.svg').default,
    description: (
      <>
        Cocos's secure multi-party computation (SMPC) platform allows multiple parties to collaboratively process data without exposing sensitive information. Powered by Trusted Execution Environments (TEEs), our platform ensures the confidentiality and privacy of your data exchanges and AI workloads.
      </>
    ),
  },
  {
    title: 'Secure VM Provisioning and Management',
    Svg: require('@site/static/img/provision.svg').default,
    description: (
      <>
        Cocos AI excels in secure VM provisioning, management, and monitoring, ensuring the confidentiality and integrity of virtualized environments. Seamlessly deploy and maintain secure Virtual Machines for your workloads.
      </>
    ),
  },
  {
    title: 'Remote Attestation Mechanism',
    Svg: require('@site/static/img/rats.svg').default,
    description: (
      <>
        Cocos AI implements a robust remote attestation mechanism, verifying the integrity of remote systems. This ensures that your workloads run in trusted environments, even in untrusted or remote settings.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
