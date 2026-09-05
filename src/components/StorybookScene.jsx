import FolderStack from './FolderStack';

export default function StorybookScene() {
  return (
    <main className="storybook-scene">
      <img
        className="storybook-scene__background"
        src="/assets/background/storybook-background.png"
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      <FolderStack />
    </main>
  );
}
