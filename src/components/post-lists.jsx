import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addPost, fetchPosts, fetchTags } from "../api/api";

const PostList = () => {
	const {
		data: postData,
		isError,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["posts"],
		queryFn: fetchPosts,
	});

	const { data: tagsData, isLoading: isTagsLoading } = useQuery({
		queryKey: ["tags"],
		queryFn: fetchTags,
	});

	const queryClinet = useQueryClient();

	console.log("tagsdata-->", tagsData);

	const {
		mutate,
		isError: isPostError,
		isPending,
		error: postError,
		reset,
	} = useMutation({
		mutationFn: addPost,
		onMutate: () => {
			//before mutation
			return { id: 1 };
		},
		onSuccess: (data, variables, context) => {
			//after mutation
			queryClinet.invalidateQueries({
				queryKey: ["posts"],
				exact: true,
				// predicate: (query) =>
				//   query.queryKey[0] === "posts" && query.queryKey[1] >= 2,
			});
		},
		// onError: (error, variables, context) => {},
		// onSettled: (data, error, variables, context) => {},
	});

	console.log(isLoading, postData);

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const title = formData.get("title");
		const tags = Array.from(formData.keys()).filter(
			(key) => formData.get(key) === "on"
		);
		if (!title || !tags) return;
		mutate({ id: postData.length + 1, title, tags });
		e.target.reset();
	};

	return (
		<div className="container">
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					name="title"
					className="postbox"
					placeholder="Enter your post..."
				/>
				<div className="tags">
					{tagsData?.map((tag) => (
						<div key={tag}>
							<label htmlFor={tag}>{tag}</label>
							<input type="checkbox" name={tag} id={tag} />
						</div>
					))}
				</div>
				<button>Post</button>
			</form>

			{isLoading && isPending && <p>Loading...</p>}
			{isError && <p>{error?.message}</p>}
			{isPostError && <p onClick={() => reset()}>Unable to Post</p>}

			{postData?.map((post) => {
				return (
					<div key={post.id} className="post">
						<div>{post.title}</div>
						{post.tags?.map((tag) => (
							<span key={tag}>{tag}</span>
						))}
					</div>
				);
			})}
		</div>
	);
};

export default PostList;
