package com.smarthealth.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smarthealth.backend.entity.BlogComment;
import com.smarthealth.backend.entity.BlogPost;

@Repository
public interface BlogCommentRepository extends JpaRepository<BlogComment, Long> {
    List<BlogComment> findByPostOrderByCreatedAtAsc(BlogPost post);
}
