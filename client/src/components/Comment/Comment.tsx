import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { getTimeDiff, getQuantifiersFromMarkdown, htmlDecode } from 'utils';
import {
  AuthorProps,
  addCommentSchema as CommentSchema
} from 'pages/SingleBug/SingleBug';

import Flex from 'components/common/Flex';
import Button, { ButtonGroup } from 'components/common/Button';
import Toast from 'components/common/Toast';

import Avatar from 'components/Avatar/Avatar';
import CodeBlock from 'components/Editor/CodeBlock';
import Editor from 'components/Editor/Editor';
import MentionPlugin from 'components/Editor/MentionPlugin';
import StyledEditor from 'components/Editor/Editor.style';
import StyledComment from './Comment.style';

import {
  editComment,
  updateBug,
  addReferences,
  mentionPeople
} from 'store/ducks/single-bug';
import { StoreState } from 'store';

const MarkdownPlugins = {
  code: CodeBlock,
  text: MentionPlugin
};

interface CommentProps {
  author: AuthorProps;
  date: string;
  body: string;
  bugId: number | string;
  commentId: string;
}

const Comment: React.FC<CommentProps> = ({
  author,
  date,
  body,
  bugId,
  commentId
}) => {
  const dispatch = useDispatch<any>();
  const userId = useSelector((state: StoreState) => state.auth.user.id);
  const [isEditing, setIsEditing] = useState(false);

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    errors: formErrors
  }: any = useForm({
    validationSchema: CommentSchema
  });

  const markdown = watch('body', body);
  const handleMarkdown = (e: any) => {
    setValue('body', e.target.value);
  };

  // using || to get the states of both comment editing & bug updating
  const [
    isEditingPending,
    editingError
  ] = useSelector(({ loading, error }: StoreState) => [
    loading['singlebug/EDIT_COMMENT'] || loading['singlebug/UPDATE_BUG'],
    error['singlebug/EDIT_COMMENT'] || error['singlebug/UPDATE_BUG']
  ]);

  const handleEditorState = (e: any) => {
    e.preventDefault();
    setValue('body', '');
    setIsEditing(!isEditing);
  };

  const onSubmit = (formData: any) => {
    if (commentId === '') {
      // update the bug's body
      dispatch(updateBug(bugId, formData)).then(() => {
        setIsEditing(!isEditing);
      });
    } else {
      // update the comment
      dispatch(editComment(bugId, commentId, formData)).then(() => {
        setIsEditing(!isEditing);
      });
    }

    const references = getQuantifiersFromMarkdown(markdown, '#');
    const mentions = getQuantifiersFromMarkdown(markdown, '@');
    references.length && dispatch(addReferences(bugId, references));
    mentions.length && dispatch(mentionPeople(bugId, mentions));
  };

  const isAuthorOfComment = userId === author.id;
  const showCommentEditor = isEditing && isAuthorOfComment;

  return (
    <StyledComment style={{ padding: showCommentEditor ? 0 : 20 }}>
      <Toast isVisible={!!editingError} message={editingError} />

      {showCommentEditor ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <StyledEditor>
            <Editor
              markdown={markdown}
              handleMarkdown={handleMarkdown}
              errors={formErrors}
              inputRef={register}
            />
            <ButtonGroup style={{ float: 'right' }}>
              <Button danger icon="times" size="sm" onClick={handleEditorState}>
                Cancel
              </Button>
              <Button
                icon="edit"
                size="sm"
                type="submit"
                isLoading={isEditingPending}
              >
                Update
              </Button>
            </ButtonGroup>
          </StyledEditor>
        </form>
      ) : (
        <>
          <Flex className="comment__header" nowrap align="center">
            <Avatar
              width="45px"
              height="45px"
              size={45}
              username={author.username}
            />
            <span className="color--gray ml-15">
              <Link
                className="text--medium"
                to={`/profiles/${author.username}`}
              >
                {author.name}{' '}
              </Link>
              commented {getTimeDiff(date)}
            </span>
            {isAuthorOfComment && (
              <span
                onClick={handleEditorState}
                style={{ marginLeft: 'auto' }}
                className="hover__button color--gray ml-15"
              >
                <FontAwesomeIcon icon="ellipsis-v" />
              </span>
            )}
          </Flex>
          <ReactMarkdown
            renderers={MarkdownPlugins}
            className="markdown-preview"
            source={htmlDecode(body)}
          />
        </>
      )}
    </StyledComment>
  );
};

export default React.memo(Comment);
