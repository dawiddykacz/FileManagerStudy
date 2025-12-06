export default function Comment({ author_name, content }) {
  return (
    <div>
      {author_name}: {content}
    </div>
  );
}
